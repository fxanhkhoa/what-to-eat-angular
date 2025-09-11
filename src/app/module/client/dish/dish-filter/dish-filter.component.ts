import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { DishService } from '@/app/service/dish.service';
import { DIFFICULT_LEVELS, MEAL_CATEGORIES } from '@/enum/dish.enum';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';
import { QueryDishDto } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  LOCALE_ID,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs';

type Tag = {
  id: string;
  value: string;
};

@Component({
  selector: 'app-dish-filter',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatSliderModule,
    MatChipsModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    CategoryTranslatePipe,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dish-filter.component.html',
  styleUrl: './dish-filter.component.scss',
})
export class DishFilterComponent implements OnInit {
  @Input() filter: QueryDishDto = {};
  @Output() search = new EventEmitter<QueryDishDto>();

  localeId = inject<string>(LOCALE_ID);
  private fb = inject(FormBuilder);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private dishService = inject(DishService);

  mealCategoriesOptions: string[] = Object.values(MEAL_CATEGORIES);
  ingredientCategoriesOptions: string[] = Object.values(INGREDIENT_CATEGORIES);
  difficultLevelsOptions: string[] = Object.values(DIFFICULT_LEVELS);

  tags: Tag[] = [];
  isLoadingSuggestions = signal<boolean>(false);
  searchSuggestions = signal<string[]>([]);

  filterForm = this.fb.group({
    keyword: [this.filter.keyword || ''],
    preparationTimeFrom: [this.filter.preparationTimeFrom || 1],
    preparationTimeTo: [this.filter.preparationTimeTo || 60],
    cookingTimeFrom: [this.filter.cookingTimeFrom || 1],
    cookingTimeTo: [this.filter.cookingTimeTo || 60],
    difficultLevels: [this.filter.difficultLevels || []],
    mealCategories: [this.filter.mealCategories || []],
    ingredientCategories: [this.filter.ingredientCategories || []],
  });

  constructor() {
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
    // Initialize tags if they exist in filter
    if (this.filter.tags) {
      this.tags = this.filter.tags.map((tag) => ({ id: tag, value: tag }));
    }

    this.setupAutoSuggestions();
  }

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

  onSuggestionSelected(suggestion: string): void {
    this.filterForm.patchValue({ keyword: suggestion });
    this.onSearch();
  }

  addTag(tag: string): void {
    if (!this.filter.tags) {
      this.filter.tags = [];
    }
    this.filter.tags = [...this.filter.tags, tag];
    this.tags = this.filter.tags.map((t) => ({ id: t, value: t }));
  }

  updateTag(tag: Tag): void {
    if (this.filter.tags) {
      this.filter.tags = this.filter.tags.map((t) => {
        if (t === tag.id) {
          return tag.value;
        }
        return t;
      });
      this.tags = this.filter.tags.map((t) => ({ id: t, value: t }));
    }
  }

  removeTag(tag: Tag): void {
    if (this.filter.tags) {
      this.filter.tags = this.filter.tags.filter((t) => t !== tag.value);
      this.tags = this.filter.tags.map((t) => ({ id: t, value: t }));
    }
  }

  onSearch(): void {
    this.search.emit(this.filterForm.value as QueryDishDto);
  }

  formatLabel(value: number): string {
    return value + $localize`m`;
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

  public get difficultyLevels() {
    return this.filterForm.get('difficultLevels');
  }
}
