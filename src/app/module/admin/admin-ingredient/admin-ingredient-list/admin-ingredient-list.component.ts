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
    CategoryTranslatePipe,
  ],
  templateUrl: './admin-ingredient-list.component.html',
  styleUrl: './admin-ingredient-list.component.scss',
})
export class AdminIngredientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'image',
    'title',
    'categories',
    'measure',
    'calories',
    'macros',
    'micronutrients',
    'updatedAt',
    'actions',
  ];

  dataSource = new MatTableDataSource<Ingredient>([]);
  searchControl = new FormControl('');
  categoryFilter = new FormControl('');

  isLoading = signal(false);
  viewMode = signal<'table' | 'grid'>('table');
  totalCount = signal(0);
  categoryCount = signal(0);
  avgCalories = signal(0);

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
      .pipe(debounceTime(350))
      .subscribe(() => {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadData();
      });

    // Category filter changes
    this.categoryFilter.valueChanges.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      this.loadData();
    });
  }

  ngAfterViewInit(): void {
    this.initTableFunctions();

    const page = parseInt(this.route.snapshot.paramMap.get('page') ?? '1', 10);
    const limit = parseInt(this.route.snapshot.paramMap.get('limit') ?? '24', 10);
    this.paginator.pageIndex = Math.max(0, page - 1);
    this.paginator.pageSize = limit;
    this.loadData();
  }

  initTableFunctions(): void {
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'title':
          return this.getTitle(item.title).toLowerCase();
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

  loadData(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const keyword = this.searchControl.value?.trim() || '';
    const selectedCategory = this.categoryFilter.value;

    const query: QueryIngredientDto = {
      page: this.paginator ? this.paginator.pageIndex + 1 : 1,
      limit: this.paginator ? this.paginator.pageSize : 24,
    };

    if (keyword) {
      query.keyword = keyword;
    }

    if (selectedCategory && selectedCategory !== 'ALL') {
      query.ingredientCategory = [selectedCategory];
    }

    this.isLoading.set(true);
    this.ingredientService
      .findAll(query)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data || [];
          this.totalCount.set(res.count || 0);

          if (this.paginator) {
            this.paginator.length = res.count || 0;
          }

          // Compute quick stats
          if (res.data && res.data.length > 0) {
            const totalCals = res.data.reduce((sum, item) => sum + (item.calories || 0), 0);
            this.avgCalories.set(Math.round(totalCals / res.data.length));

            const uniqueCats = new Set<string>();
            res.data.forEach((i) => (i.ingredientCategory || []).forEach((c) => uniqueCats.add(c)));
            this.categoryCount.set(uniqueCats.size);
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
    if (!titles || titles.length === 0) return 'Unnamed';
    const english = titles.find((t) => t.lang === 'en');
    return english ? english.data : titles[0].data || 'Unnamed';
  }

  getSecondaryTitle(titles: MultiLanguage<string>[]): string | null {
    if (!titles || titles.length < 2) return null;
    const secondary = titles.find((t) => t.lang !== 'en');
    return secondary ? secondary.data : null;
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
