import { CommonModule } from '@angular/common';
import { Component, inject, LOCALE_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ingredient',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './ingredient.component.html',
  styleUrl: './ingredient.component.scss',
})
export class IngredientComponent {
  private route = inject(ActivatedRoute);
  localeId = inject(LOCALE_ID);

  rows: any[] = [];
  total: number = 0;
  keyword: string = '';
  page: number = 1;
  limit: number = 10;
  lang: string = '';

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.keyword = params['keyword'] || '';
      this.page = +params['page'] || 1;
      this.loadIngredients();
    });
  }

  onSearch(keyword: string) {
    this.keyword = keyword;
    this.page = 1; // Reset to first page on new search
    this.loadIngredients();
  }

  loadIngredients() {
    // Logic to load ingredients based on current state (keyword, page, etc.)
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadIngredients();
  }
}
