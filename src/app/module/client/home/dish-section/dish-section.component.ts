import { MEAL_CATEGORIES } from '@/enum/dish.enum';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-dish-section',
  imports: [FormsModule, ReactiveFormsModule, MatListModule, MatIconModule],
  templateUrl: './dish-section.component.html',
  styleUrl: './dish-section.component.scss',
})
export class DishSectionComponent {
  private fb = inject(FormBuilder);

  mealCategories = Object.values(MEAL_CATEGORIES);

  mealCategoryForm: FormGroup = this.fb.group({
    mealCategory: [''],
  });
}
