import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { DishService } from '@/app/service/dish.service';
import { MEAL_CATEGORIES } from '@/enum/dish.enum';
import { Dish } from '@/types/dish.type';
import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { CategoryBadgesComponent } from '@/app/shared/component/category-badges/category-badges.component';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dish-section',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MultiLanguagePipe,
    MatButtonModule,
    MatTooltipModule,
    CategoryBadgesComponent,
    DecimalPipe,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './dish-section.component.html',
  styleUrl: './dish-section.component.scss',
})
export class DishSectionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dishService = inject(DishService);
  localeId = inject<string>(LOCALE_ID);

  mealCategories = Object.values(MEAL_CATEGORIES);
  isLoading = false;
  dishes: Dish[] = [];

  mealCategoryForm: FormGroup = this.fb.group({
    mealCategory: [''],
  });

  ngOnInit(): void {
    this.getDishes();
  }

  getDishes() {
    this.isLoading = true;
    this.dishService
      .findRandom(8)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((res) => {
        this.dishes = res;
      });
  }
}
