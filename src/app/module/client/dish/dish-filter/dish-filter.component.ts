import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
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
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  ],
  templateUrl: './dish-filter.component.html',
  styleUrl: './dish-filter.component.scss',
})
export class DishFilterComponent implements OnInit {
  @Input() filter: QueryDishDto = {};
  @Output() search = new EventEmitter<QueryDishDto>();

  localeId = inject<string>(LOCALE_ID);
  private fb = inject(FormBuilder);

  mealCategoriesOptions: string[] = Object.values(MEAL_CATEGORIES);
  ingredientCategoriesOptions: string[] = Object.values(INGREDIENT_CATEGORIES);
  difficultLevelsOptions: string[] = Object.values(DIFFICULT_LEVELS);

  tags: Tag[] = [];

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

  ngOnInit(): void {
    // Initialize tags if they exist in filter
    if (this.filter.tags) {
      this.tags = this.filter.tags.map((tag) => ({ id: tag, value: tag }));
    }
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
    this.search.emit(this.filter);
  }

  formatLabel(value: number): string {
    return `${value}`;
  }
}
