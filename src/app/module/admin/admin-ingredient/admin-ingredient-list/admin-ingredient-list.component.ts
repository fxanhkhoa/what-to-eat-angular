import { Ingredient, QueryIngredientDto } from '@/types/ingredient.type';
import {
  AfterViewInit,
  Component,
  inject,
  makeStateKey,
  OnInit,
  PLATFORM_ID,
  TransferState,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MultiLanguage } from '@/types/base.type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, isPlatformServer } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { IngredientService } from '@/app/service/ingredient.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, finalize } from 'rxjs';
import { ToastService } from '@/app/shared/service/toast.service';

@Component({
  selector: 'app-admin-ingredient-list',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './admin-ingredient-list.component.html',
  styleUrl: './admin-ingredient-list.component.scss',
})
export class AdminIngredientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'action',
    'slug',
    'title',
    'measure',
    'calories',
    'carbohydrate',
    'fat',
    'ingredientCategory',
    'weight',
    'protein',
    'cholesterol',
    'sodium',
    'updatedAt',
  ];

  dataSource = new MatTableDataSource<Ingredient>([]);
  searchControl = new FormControl('');
  categoryFilter = new FormControl('');
  totalItems = 0;
  pageSize = 25;
  currentPage = 1;
  isLoading = false;

  availableCategories: string[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private ingredientService = inject(IngredientService);
  private route = inject(ActivatedRoute);
  private platformId = inject<string>(PLATFORM_ID);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    // Subscribe to search input changes
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        if (value === '') {
          this.loadData();
        } else if (value && value !== '') {
          this.loadData(value);
        }
      });

    // Subscribe to category filter changes
    this.categoryFilter.valueChanges.subscribe((value) => {
      this.filterByCategory(value || '');
    });

    // Load data (replace with your actual data loading)
    const page = parseInt(this.route.snapshot.paramMap.get('page') ?? '1', 10);
    const limit = parseInt(
      this.route.snapshot.paramMap.get('limit') ?? '25',
      10
    );
    this.currentPage = page;
    this.pageSize = limit;
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initTableFunctions();
  }

  initTableFunctions() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Custom sorting for title field (multilanguage)
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'title':
          // Sort by the English title or first available title
          const englishTitle = item.title.find((t) => t.lang === 'en');
          return englishTitle ? englishTitle.data : item.title[0]?.data || '';
        case 'ingredientCategory':
          return item.ingredientCategory.join(', ');
        default:
          return item[property as keyof Ingredient] as string | number;
      }
    };
  }

  loadData(keyword?: string) {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    const query: QueryIngredientDto = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (keyword) {
      query.keyword = keyword;
    }

    this.isLoading = true;
    this.ingredientService
      .findAll(query)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((res) => {
        if (res.count === 0) {
          this.dataSource.data = [];
          return;
        }
        this.dataSource.data = res.data;

        // Extract all unique categories for the filter
        const allCategories = new Set<string>();
        res.data.forEach((item) => {
          item.ingredientCategory.forEach((cat) => allCategories.add(cat));
        });
        this.availableCategories = Array.from(allCategories).sort();
        this.totalItems = res.count;

        setTimeout(() => {
          this.dataSource.sort = this.sort;
        }, 500);
      });
  }

  pageChanged(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    console.log(this.currentPage, this.pageSize);
    this.loadData();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByCategory(category: string) {
    if (!category) {
      // Reset the filter
      this.dataSource.filterPredicate = (data, filter) =>
        !filter || filter === '' ? true : data.slug.includes(filter);
      this.dataSource.filter = this.searchControl.value || '';
      return;
    }

    // Set custom filter predicate to filter by category
    this.dataSource.filterPredicate = (data: Ingredient, filter: string) => {
      const searchTerm = this.searchControl.value?.toLowerCase() || '';

      // Check if ingredient belongs to the selected category
      const matchesCategory = data.ingredientCategory.includes(category);

      // Check if ingredient matches the search term
      const titleMatch = data.title.some((t) =>
        t.data.toLowerCase().includes(searchTerm)
      );
      const slugMatch = data.slug.toLowerCase().includes(searchTerm);

      const matchesSearch = !searchTerm || titleMatch || slugMatch;

      return matchesCategory && matchesSearch;
    };

    // Trigger filtering
    this.dataSource.filter = category;
  }

  // Helper method to get displayable title
  getTitle(titles: MultiLanguage<string>[]): string {
    const englishTitle = titles.find((t) => t.lang === 'en');
    return englishTitle ? englishTitle.data : titles[0]?.data || 'N/A';
  }

  clearFilters() {
    this.searchControl.setValue('');
    this.categoryFilter.setValue('');
    this.dataSource.filter = '';
  }

  onDelete(id: string) {
    this.toastService
      .showConfirm(
        'Delete Ingredient',
        'Are you sure you want to delete this ingredient?'
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.ingredientService.delete(id).subscribe(() => {
            this.toastService.showSuccess(
              $localize`Deleted`,
              $localize`Ingredient deleted successfully`,
              1500
            );
            this.loadData();
          });
        }
      });
  }
}
