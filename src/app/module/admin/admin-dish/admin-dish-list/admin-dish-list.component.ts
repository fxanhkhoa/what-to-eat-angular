import { DIFFICULT_LEVELS, MEAL_CATEGORIES } from '@/enum/dish.enum';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';
import { MultiLanguage } from '@/types/base.type';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { CommonModule, isPlatformServer } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  LOCALE_ID,
  OnChanges,
  OnInit,
  PLATFORM_ID,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { distinctUntilChanged, finalize } from 'rxjs';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { DishService } from '@/app/service/dish.service';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { ToastService } from '@/app/shared/service/toast.service';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';

@Component({
  selector: 'app-admin-dish-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
    MatChipsModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    CategoryTranslatePipe,
  ],
  templateUrl: './admin-dish-list.component.html',
  styleUrl: './admin-dish-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDishListComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private dishService = inject(DishService);
  private toastService = inject(ToastService);
  private platformId = inject<string>(PLATFORM_ID);
  localeId = inject(LOCALE_ID);

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  displayedColumns: string[] = [
    'actions',
    'thumbnail',
    'title',
    'preparationTime',
    'cookingTime',
    'difficultLevel',
    'mealCategories',
  ];
  dataSource: MatTableDataSource<Dish>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm: FormGroup = new FormGroup([]);
  isFilterExpanded = false;

  difficultLevelOptions: string[] = Object.values(DIFFICULT_LEVELS);
  mealCategoryOptions: string[] = Object.values(MEAL_CATEGORIES);
  ingredientCategoryOptions: string[] = Object.values(INGREDIENT_CATEGORIES);

  // For tags, ingredients, and labels
  tags: string[] = [];
  ingredients: string[] = [];
  labels: string[] = [];

  isLoading = signal(false);

  constructor() {
    // Initialize with empty array, replace with your data source
    this.dataSource = new MatTableDataSource<Dish>([]);
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      keyword: [''],
      tags: [[]],
      preparationTimeFrom: [null],
      preparationTimeTo: [null],
      cookingTimeFrom: [null],
      cookingTimeTo: [null],
      difficultLevels: [[]],
      mealCategories: [[]],
      ingredientCategories: [[]],
      ingredients: [[]],
      labels: [[]],
    });
  }

  ngAfterViewInit() {
    this.initTable();
    this.loadDishes();
  }

  initTable() {
    this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'title':
          // Sort by the English title or first available title
          const englishTitle = item.title.find((t) => t.lang === 'en');
          return englishTitle ? englishTitle.data : item.title[0]?.data || '';
        case 'mealCategories':
          return item.mealCategories.join(', ');
        default:
          return item[property as keyof Dish] as string | number;
      }
    };
  }

  loadDishes() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.isLoading.set(true);
    this.dishService
      .findAll({
        ...this.cleanFormValue(this.filterForm.value),
        page: this.paginator.pageIndex + 1,
        limit: this.paginator.pageSize,
      })
      .pipe(
        distinctUntilChanged(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        if (res.count === 0) {
          this.dataSource.data = [];
          return;
        }
        this.dataSource.data = res.data;
        this.paginator.length = res.count;

        setTimeout(() => {
          this.dataSource.sort = this.sort;
        }, 500);
      });
  }

  // Helper method to get title in default language (assuming English is default)
  getDefaultTitle(titles: MultiLanguage<string>[]): string {
    const defaultTitle = titles.find((t) => t.lang === 'en');
    return defaultTitle ? defaultTitle.data : 'No title available';
  }

  deleteDish(dish: Dish): void {
    this.toastService
      .showConfirm(
        $localize`Delete Dish`,
        $localize`Are you sure you want to delete "${
          dish.title.find((t) => t.lang === 'en')!.data
        }"?`
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.dishService.delete(dish._id).subscribe(() => {
            this.toastService.showSuccess(
              $localize`Deleted`,
              $localize`Ingredient deleted successfully`,
              1500
            );
            this.loadDishes();
          });
        }
      });
  }

  toggleFilter(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  clearFilter(): void {
    this.filterForm.reset({
      keyword: '',
      tags: [],
      preparationTimeFrom: null,
      preparationTimeTo: null,
      cookingTimeFrom: null,
      cookingTimeTo: null,
      difficultLevels: [],
      mealCategories: [],
      ingredientCategories: [],
      ingredients: [],
      labels: [],
    });

    // Clear chip arrays
    this.tags = [];
    this.ingredients = [];
    this.labels = [];
  }

  applyFilter(query: QueryDishDto): void {
    this.loadDishes();
  }

  // Chip input methods
  addChip(
    event: MatChipInputEvent,
    type: 'tags' | 'ingredients' | 'labels'
  ): void {
    const value = (event.value || '').trim();

    if (value) {
      // Add the chip
      switch (type) {
        case 'tags':
          if (!this.tags.includes(value)) {
            this.tags.push(value);
            this.filterForm.patchValue({ tags: this.tags });
          }
          break;
        case 'ingredients':
          if (!this.ingredients.includes(value)) {
            this.ingredients.push(value);
            this.filterForm.patchValue({ ingredients: this.ingredients });
          }
          break;
        case 'labels':
          if (!this.labels.includes(value)) {
            this.labels.push(value);
            this.filterForm.patchValue({ labels: this.labels });
          }
          break;
      }
    }

    // Reset the input value
    event.chipInput!.clear();
  }

  removeChip(value: string, type: 'tags' | 'ingredients' | 'labels'): void {
    let index = -1;

    switch (type) {
      case 'tags':
        index = this.tags.indexOf(value);
        if (index >= 0) {
          this.tags.splice(index, 1);
          this.filterForm.patchValue({ tags: this.tags });
        }
        break;
      case 'ingredients':
        index = this.ingredients.indexOf(value);
        if (index >= 0) {
          this.ingredients.splice(index, 1);
          this.filterForm.patchValue({ ingredients: this.ingredients });
        }
        break;
      case 'labels':
        index = this.labels.indexOf(value);
        if (index >= 0) {
          this.labels.splice(index, 1);
          this.filterForm.patchValue({ labels: this.labels });
        }
        break;
    }
  }

  // Remove empty properties from the form value
  cleanFormValue(formValue: any): QueryDishDto {
    const query: QueryDishDto = {};

    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];

      if (value === null || value === undefined || value === '') {
        return;
      }

      if (Array.isArray(value) && value.length === 0) {
        return;
      }

      query[key as keyof QueryDishDto] = value;
    });

    return query;
  }
}
