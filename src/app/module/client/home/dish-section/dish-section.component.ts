import { DishService } from '@/app/service/dish.service';
import { MEAL_CATEGORIES } from '@/enum/dish.enum';
import { Dish } from '@/types/dish.type';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dish-section',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dish-section.component.html',
  styleUrl: './dish-section.component.scss',
})
export class DishSectionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dishService = inject(DishService);

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
        this.dishes = res.data;
      });
  }
}
