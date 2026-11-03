import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { debounceTime, finalize } from 'rxjs';

import { Ingredient, QueryIngredientDto } from '@/types/ingredient.type';
import { MultiLanguage } from '@/types/base.type';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';
import { IngredientService } from '@/app/service/ingredient.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { ImageViewerComponent } from '@/app/shared/widget/image-viewer/image-viewer.component';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { AdminIngredientDetailDialogComponent } from '../admin-ingredient-detail-dialog/admin-ingredient-detail-dialog.component';

@Component({
  selector: 'app-admin-ingredient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule,
    MatMenuModule,
    CategoryTranslatePipe,
  ],
  templateUrl: './admin-ingredient-list.component.html',
  styleUrl: './admin-ingredient-list.component.scss',
})
export class AdminIngredientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'image',
    'slug',
    'title',
    'categories',
    'measure',
    'calories',
    'macros',
    'micronutrients',
    'updatedAt',
    'action',
  ];

  dataSource = new MatTableDataSource<Ingredient>([]);
  searchControl = new FormControl('');
  categoryFilter = new FormControl('');

  isLoading = signal(false);
  viewMode = signal<'table' | 'grid'>('table');
  totalCount = signal(0);
  categoryCount = signal(0);
  avgCalories = signal(0);

  availableCategories: string[] = [];
  allCategories = Object.values(INGREDIENT_CATEGORIES);
  quickCategories: string[] = [
    'ALL',
    INGREDIENT_CATEGORIES.VEGETABLES,
    INGREDIENT_CATEGORIES.PROTEIN_FOODS,
    INGREDIENT_CATEGORIES.FRUIT,
    INGREDIENT_CATEGORIES.GRAINS,
    INGREDIENT_CATEGORIES.MILK_AND_DAIRY,
    INGREDIENT_CATEGORIES.HERBS_AND_SPICES,
    INGREDIENT_CATEGORIES.FATS_AND_OILS,
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private ingredientService = inject(IngredientService);
  private route = inject(ActivatedRoute);
  private platformId = inject<string>(PLATFORM_ID);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('admin_ingredient_view_mode') as 'table' | 'grid';
      if (savedMode === 'table' || savedMode === 'grid') {
        this.viewMode.set(savedMode);
      }
    }

    // Debounced search
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        if (value === '') {
          this.loadData();
        } else if (value && value !== '') {
          this.loadData(value);
        }
      });

    // Category filter changes
    this.categoryFilter.valueChanges.subscribe((value) => {
      this.filterByCategory(value || '');
    });
  }

  ngAfterViewInit(): void {
    this.initTableFunctions();

    const page = parseInt(this.route.snapshot.paramMap.get('page') ?? '1', 10);
    const limit = parseInt(this.route.snapshot.paramMap.get('limit') ?? '24', 10);
    if (this.paginator) {
      this.paginator.pageIndex = Math.max(0, page - 1);
      this.paginator.pageSize = limit;
    }
    this.loadData();
  }

  initTableFunctions(): void {
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'title':
          const englishTitle = item.title?.find((t) => t.lang === 'en');
          return englishTitle ? englishTitle.data : item.title?.[0]?.data || '';
        case 'ingredientCategory':
        case 'categories':
          return (item.ingredientCategory || []).join(', ');
        case 'calories':
          return item.calories || 0;
        case 'updatedAt':
          return item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
        default:
          return (item[property as keyof Ingredient] as string | number) ?? '';
      }
    };
  }

  setViewMode(mode: 'table' | 'grid'): void {
    this.viewMode.set(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('admin_ingredient_view_mode', mode);
    }
  }

  loadData(keyword?: string): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const query: QueryIngredientDto = {
      page: this.paginator ? this.paginator.pageIndex + 1 : 1,
      limit: this.paginator ? this.paginator.pageSize : 24,
    };

    const effectiveKeyword = keyword !== undefined ? keyword : this.searchControl.value?.trim() || '';
    if (effectiveKeyword) {
      query.keyword = effectiveKeyword;
    }

    const selectedCategory = this.categoryFilter.value;
    if (selectedCategory && selectedCategory !== 'ALL') {
      query.ingredientCategory = [selectedCategory];
    }

    this.isLoading.set(true);
    this.ingredientService
      .findAll(query)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.count === 0) {
            this.dataSource.data = [];
            this.totalCount.set(0);
            this.avgCalories.set(0);
            this.categoryCount.set(0);
            this.availableCategories = [];
            if (this.paginator) {
              this.paginator.length = 0;
            }
            return;
          }

          this.dataSource.data = res.data || [];
          this.totalCount.set(res.count || 0);

          if (this.paginator) {
            this.paginator.length = res.count || 0;
          }

          // Extract all unique categories
          const allCats = new Set<string>();
          (res.data || []).forEach((item) => {
            (item.ingredientCategory || []).forEach((cat) => allCats.add(cat));
          });
          this.availableCategories = Array.from(allCats).sort();

          // Compute quick stats
          if (res.data && res.data.length > 0) {
            const totalCals = res.data.reduce((sum, item) => sum + (item.calories || 0), 0);
            this.avgCalories.set(Math.round(totalCals / res.data.length));
            this.categoryCount.set(allCats.size);
          } else {
            this.avgCalories.set(0);
            this.categoryCount.set(0);
          }

          setTimeout(() => {
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
          }, 200);
        },
        error: () => {
          this.toastService.showError($localize`Error`, $localize`Failed to load ingredients`, 3000);
        },
      });
  }

  getTitle(titles: MultiLanguage<string>[]): string {
    if (!titles || titles.length === 0) return 'N/A';
    const english = titles.find((t) => t.lang === 'en');
    return english ? english.data : titles[0]?.data || 'N/A';
  }

  getSecondaryTitle(titles: MultiLanguage<string>[]): string | null {
    if (!titles || titles.length < 2) return null;
    const secondary = titles.find((t) => t.lang !== 'en');
    return secondary ? secondary.data : null;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByCategory(category: string): void {
    if (!category) {
      this.dataSource.filterPredicate = (data, filter) =>
        !filter || filter === '' ? true : data.slug.includes(filter);
      this.dataSource.filter = this.searchControl.value || '';
      return;
    }

    this.dataSource.filterPredicate = (data: Ingredient, filter: string) => {
      const searchTerm = this.searchControl.value?.toLowerCase() || '';
      const matchesCategory = (data.ingredientCategory || []).includes(category);
      const titleMatch = (data.title || []).some((t) =>
        t.data.toLowerCase().includes(searchTerm)
      );
      const slugMatch = (data.slug || '').toLowerCase().includes(searchTerm);
      const matchesSearch = !searchTerm || titleMatch || slugMatch;

      return matchesCategory && matchesSearch;
    };

    this.dataSource.filter = category;
  }

  selectQuickCategory(category: string): void {
    if (category === 'ALL') {
      this.categoryFilter.setValue('');
    } else {
      this.categoryFilter.setValue(category);
    }
  }

  isCategorySelected(category: string): boolean {
    const current = this.categoryFilter.value;
    if (category === 'ALL') {
      return !current || current === '';
    }
    return current === category;
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.categoryFilter.setValue('');
    this.dataSource.filter = '';
  }

  hasActiveFilters(): boolean {
    return !!(this.searchControl.value || this.categoryFilter.value);
  }

  copySlug(slug: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (slug && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(slug);
      this.toastService.showSuccess($localize`Copied`, $localize`Slug copied to clipboard`, 2000);
    }
  }

  openDetailDialog(ingredient: Ingredient, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.dialog.open(AdminIngredientDetailDialogComponent, {
      data: ingredient,
      width: '95%',
      maxWidth: '820px',
      autoFocus: false,
    });
  }

  previewImage(imageUrl: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.dialog.open(ImageViewerComponent, {
      data: imageUrl,
      width: '80%',
      maxWidth: '1200px',
      autoFocus: false,
    });
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/images/placeholder.png';
    event.target.classList?.add('error-image');
  }

  onDelete(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.toastService
      .showConfirm(
        $localize`Delete Ingredient`,
        $localize`Are you sure you want to delete this ingredient? This action cannot be undone.`
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.ingredientService.delete(id).subscribe({
            next: () => {
              this.toastService.showSuccess(
                $localize`Deleted`,
                $localize`Ingredient deleted successfully`,
                1500
              );
              this.loadData();
            },
            error: () => {
              this.toastService.showError($localize`Error`, $localize`Failed to delete ingredient`, 3000);
            },
          });
        }
      });
  }
}
