import { CommonModule } from '@angular/common';
import { Component, inject, LOCALE_ID, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IngredientCardComponent } from './ingredient-card/ingredient-card.component';
import { Ingredient, QueryIngredientDto } from '@/types/ingredient.type';
import { EmptyComponent } from '../../../components/empty/empty.component';
import { SearchBarComponent } from '../../../shared/component/search-bar/search-bar.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { IngredientService } from '@/app/service/ingredient.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-ingredient',
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    IngredientCardComponent,
    EmptyComponent,
    SearchBarComponent,
    RouterModule,
    MatPaginatorModule,
    MatButtonModule,
  ],
  templateUrl: './ingredient.component.html',
  styleUrl: './ingredient.component.scss',
})
export class IngredientComponent {
  private route = inject(ActivatedRoute);
  localeId = inject(LOCALE_ID);
  private ingredientService = inject(IngredientService);

  rows = signal<Ingredient[]>([]);
  loading = signal<boolean>(false);
  limit = signal(10);
  total = signal(0);
  currentPage = signal(1);
  keyword = signal<string>('');
  dto: QueryIngredientDto = {};

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.keyword.set(params['keyword'] || '');
      this.currentPage.set(+params['page'] || 1);
      this.loadIngredients();
    });
  }

  onSearch(keyword: string) {
    this.keyword.set(keyword);
    this.currentPage.set(1); // Reset to first page on new search
    this.loadIngredients();
  }

  loadIngredients() {
    this.loading.set(true);
    this.ingredientService
      .findAll({
        ...this.dto,
        limit: this.limit(),
        page: this.currentPage(),
        keyword: this.keyword(),
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((res) => {
        this.rows.set(res.data);
        this.total.set(res.count);
      });
  }

  paginatorChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.dto.page = this.currentPage();
    this.loadIngredients();
  }

  goBack() {
    window.history.back();
  }
}
