import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { DishService } from '@/app/service/dish.service';
import { MEAL_CATEGORIES } from '@/enum/dish.enum';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import { Component, inject, LOCALE_ID, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DishCardFancyComponent } from './dish-card-fancy/dish-card-fancy.component';
import { EmptyComponent } from '@/app/components/empty/empty.component';

@Component({
  selector: 'app-dish',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CategoryTranslatePipe,
    DishCardFancyComponent,
    EmptyComponent,
  ],
  templateUrl: './dish.component.html',
  styleUrl: './dish.component.scss',
})
export class DishComponent implements OnInit {
  localeId = inject<string>(LOCALE_ID);
  private dishService = inject(DishService);
  Math = Math;

  listMealCategories: string[] = [];
  listDishCategory_1 = signal<Dish[]>([]);
  listDishCategory_2 = signal<Dish[]>([]);
  listDishCategory_3 = signal<Dish[]>([]);
  listDishCategory_4 = signal<Dish[]>([]);

  ngOnInit(): void {
    this.listMealCategories = this.getRandomMealCategories(4);
    this.getDishes_1();
    this.getDishes_2();
    this.getDishes_3();
    this.getDishes_4();
  }

  getDishes_1() {
    this.dishService
      .findAll({
        page: 1,
        limit: 10,
        mealCategories: [this.listMealCategories[0]],
      })
      .subscribe((res) => {
        if (res.data) {
          this.listDishCategory_1.set(res.data);
        }
      });
  }

  getDishes_2() {
    this.dishService
      .findAll({
        page: 1,
        limit: 1,
        mealCategories: [this.listMealCategories[1]],
      })
      .subscribe((res) => {
        if (res.data) {
          this.listDishCategory_2.set(res.data);
        }
      });
  }

  getDishes_3() {
    this.dishService
      .findAll({
        page: 1,
        limit: 4,
        mealCategories: [this.listMealCategories[2]],
      })
      .subscribe((res) => {
        if (res.data) {
          this.listDishCategory_3.set(res.data);
        }
      });
  }

  getDishes_4() {
    this.dishService
      .findAll({
        page: 1,
        limit: 3,
        mealCategories: [this.listMealCategories[3]],
      })
      .subscribe((res) => {
        if (res.data) {
          this.listDishCategory_4.set(res.data);
        }
      });
  }

  getRandomMealCategories(count: number): string[] {
    // Make a copy of the array to avoid modifying the original
    const availableCategories = [...Object.values(MEAL_CATEGORIES)];
    const randomCategories: string[] = [];

    // Get the minimum of requested count or available categories length
    const selectCount = Math.min(count, availableCategories.length);

    // Select random categories
    for (let i = 0; i < selectCount; i++) {
      // Get a random index
      const randomIndex = Math.floor(
        Math.random() * availableCategories.length
      );
      // Add the category at that index to our result
      randomCategories.push(availableCategories[randomIndex]);
      // Remove that category from available options to avoid duplicates
      availableCategories.splice(randomIndex, 1);
    }

    return randomCategories;
  }

  goBack() {
    window.history.back();
  }
}
