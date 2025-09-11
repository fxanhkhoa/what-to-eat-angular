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
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { distinctUntilChanged, finalize, debounceTime, switchMap } from 'rxjs';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { DishService } from '@/app/service/dish.service';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { ToastService } from '@/app/shared/service/toast.service';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { startWith, map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

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
    MultiLanguagePipe,
    MatAutocompleteModule,
    MatBadgeModule,
    MatCardModule,
    MatExpansionModule,
  ],
  templateUrl: './admin-dish-list.component.html',
  styleUrl: './admin-dish-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDishListComponent implements OnInit, AfterViewInit {
  jumpToPage: number = 1;
  private fb = inject(FormBuilder);
  private dishService = inject(DishService);
  private toastService = inject(ToastService);
  private platformId = inject<string>(PLATFORM_ID);
  localeId = inject(LOCALE_ID);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  displayedColumns: string[] = [
    'actions',
    'thumbnail',
    'title',
    'preparationTime',
    'difficultLevel',
  ];
  dataSource: MatTableDataSource<Dish>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm: FormGroup = new FormGroup([]);
  isFilterExpanded = false;

  difficultLevelOptions: string[] = Object.values(DIFFICULT_LEVELS);
  mealCategoryOptions: string[] = Object.values(MEAL_CATEGORIES);
  ingredientCategoryOptions: string[] = Object.values(INGREDIENT_CATEGORIES);

  // Enhanced search properties
  searchSuggestions = signal<string[]>([]);
  isLoadingSuggestions = signal<boolean>(false);
  useEnhancedSearch = signal<boolean>(true);
  searchMode: 'basic' | 'enhanced' = 'enhanced';
  totalResults = signal<number>(0);
  searchTime = signal<number>(0);

  // Quick search chips
  quickSearchTags = [
    'chicken',
    'vegetarian',
    'spicy',
    'easy',
    'quick',
    'healthy',
  ];

  // Make Math available in template
  Math = Math;

  // For tags, ingredients, and labels
  tags: string[] = [];
  ingredients: string[] = [];
  labels: string[] = [];

  isLoading = signal(false);

  constructor() {
    // Initialize with empty array, replace with your data source
    this.dataSource = new MatTableDataSource<Dish>([]);

    this.iconRegistry.addSvgIcon(
      'easy',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/easy.svg')
    );
    this.iconRegistry.addSvgIcon(
      'medium',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/medium.svg')
    );
    this.iconRegistry.addSvgIcon(
      'hard',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/hard.svg')
    );
    this.iconRegistry.addSvgIcon(
      'cooking_time',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/cooking_time.svg'
      )
    );
    this.iconRegistry.addSvgIcon(
      'preparation_time',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/preparation_time.svg'
      )
    );
    this.iconRegistry.addSvgIcon(
      'search',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/search.svg')
    );
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
    this.setupAutoSuggestions();
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
          const englishTitle = item.title.find((t) => t.lang === this.localeId);
          return englishTitle ? englishTitle.data : item.title[0]?.data || '';
        case 'difficultLevel':
          return item.mealCategories.join(', ');
        case 'preparationTime':
          return (item.preparationTime || 0) + (item.cookingTime || 0);
        default:
          return item[property as keyof Dish] as string | number;
      }
    };
  }

  loadDishes() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.searchWithMode();
  }

  onJumpToPage() {
    if (!this.paginator) return;
    const page = Math.max(
      1,
      Math.min(this.jumpToPage, this.paginator.getNumberOfPages())
    );
    this.paginator.pageIndex = page - 1;
    this.loadDishes();
  }

  // Helper method to get title in default language (assuming English is default)
  getDefaultTitle(titles: MultiLanguage<string>[]): string {
    const defaultTitle = titles.find((t) => t.lang === this.localeId);
    return defaultTitle ? defaultTitle.data : 'No title available';
  }

  deleteDish(dish: Dish): void {
    this.toastService
      .showConfirm(
        $localize`Delete Dish`,
        $localize`Are you sure you want to delete "${
          dish.title.find((t) => t.lang === this.localeId)!.data
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

    // Clear search state
    this.searchSuggestions.set([]);
    this.searchWithMode();
  }

  applyFilter(query: QueryDishDto): void {
    this.searchWithMode();
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

  // Enhanced search methods
  setupAutoSuggestions(): void {
    const keywordControl = this.filterForm.get('keyword');
    if (keywordControl) {
      keywordControl.valueChanges
        .pipe(
          startWith(''),
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((value) => {
            if (value && value.length >= 2) {
              this.isLoadingSuggestions.set(true);
              return this.dishService
                .getSuggestions(value, 8)
                .pipe(finalize(() => this.isLoadingSuggestions.set(false)));
            }
            return [];
          })
        )
        .subscribe((suggestions) => {
          this.searchSuggestions.set(suggestions);
        });
    }
  }

  // Handle Enter key press in search input
  onSearchEnter(): void {
    const keyword = this.filterForm.get('keyword')?.value || '';
    console.log('Enter key pressed, performing search with keyword:', keyword);
    this.searchWithMode();
  }

  private searchOnAutocompleteClose = false;

  // Handle key events in the search input
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      // Check if autocomplete panel is open
      const input = event.target as HTMLInputElement;
      const autocompletePanel = document.querySelector('mat-autocomplete-panel');
      
      if (autocompletePanel && autocompletePanel.clientHeight > 0) {
        // Autocomplete is open, set flag to search when it closes
        this.searchOnAutocompleteClose = true;
        
        // Close the autocomplete panel
        if (input && input.blur) {
          input.blur();
          setTimeout(() => input.focus(), 100);
        }
      } else {
        // Autocomplete is not open, search immediately
        this.onSearchEnter();
      }
    }
  }

  // Handle autocomplete close event
  onAutocompleteClosed(): void {
    if (this.searchOnAutocompleteClose) {
      this.searchOnAutocompleteClose = false;
      setTimeout(() => {
        this.onSearchEnter();
      }, 50);
    }
  }

  searchWithMode(): void {
    const startTime = performance.now();
    this.isLoading.set(true);

    const searchQuery = {
      ...this.cleanFormValue(this.filterForm.value),
      page: this.paginator ? this.paginator.pageIndex + 1 : 1,
      limit: this.paginator ? this.paginator.pageSize : 10,
    };

    const searchMethod = this.useEnhancedSearch()
      ? this.dishService.findWithScore(searchQuery)
      : this.dishService.findAll(searchQuery);

    searchMethod
      .pipe(
        distinctUntilChanged(),
        finalize(() => {
          this.isLoading.set(false);
          const endTime = performance.now();
          this.searchTime.set(Math.round(endTime - startTime));
        })
      )
      .subscribe((res) => {
        this.totalResults.set(res.count);
        this.dataSource.data = res.data;
        if (this.paginator) {
          this.paginator.length = res.count;
        }

        setTimeout(() => {
          this.dataSource.sort = this.sort;
        }, 500);
      });
  }

  toggleSearchMode(): void {
    this.useEnhancedSearch.set(!this.useEnhancedSearch());
    this.searchMode = this.useEnhancedSearch() ? 'enhanced' : 'basic';
    this.searchWithMode();
  }

  applyQuickSearch(tag: string): void {
    this.filterForm.patchValue({ keyword: tag });
    this.searchWithMode();
  }

  clearSearch(): void {
    this.filterForm.reset();
    this.searchSuggestions.set([]);
    this.tags = [];
    this.ingredients = [];
    this.labels = [];
    this.searchWithMode();
  }

  onSuggestionSelected(suggestion: string): void {
    // Reset the search flag since we're selecting a suggestion
    this.searchOnAutocompleteClose = false;
    this.filterForm.patchValue({ keyword: suggestion });
    this.searchWithMode();
  }

  toggleDifficultyLevel(level: string) {
    if (this.difficultyLevels?.value?.includes(level)) {
      this.difficultyLevels?.setValue(
        this.difficultyLevels?.value?.filter((l: string) => l !== level)
      );
    } else {
      this.filterForm
        .get('difficultLevels')
        ?.setValue([...this.difficultyLevels?.value!, level]);
    }
  }

  formatLabel(value: number): string {
    return value + $localize`m`;
  }

  public get difficultyLevels() {
    return this.filterForm.get('difficultLevels');
  }
}
