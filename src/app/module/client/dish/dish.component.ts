import { DishService } from '@/app/service/dish.service';
import { MEAL_CATEGORIES } from '@/enum/dish.enum';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dish',
  imports: [CommonModule, RouterModule],
  templateUrl: './dish.component.html',
  styleUrl: './dish.component.scss',
})
export class DishComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  localeId = inject<string>(LOCALE_ID);
  private dishService = inject(DishService);
  Math = Math;

  rows: Dish[] = [];
  keyword: string = '';
  lang: string = '';
  limit: number = 10;
  page: number = 1;
  total: number = 0;
  filter: QueryDishDto = {};
  selectedLanguage: string = '';
  pages: any[] = [];

  listMealCategories: string[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.page = Number(params['page']) || 1;
      this.limit = Number(params['limit']) || 10;
      this.keyword = params['keyword'] || '';
      this.filter = {};
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
}
