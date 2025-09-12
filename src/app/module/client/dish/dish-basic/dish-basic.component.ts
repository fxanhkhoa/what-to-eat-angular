import { Dish, QueryDishDto } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Meta, Title } from '@angular/platform-browser';
import { DishFilterComponent } from '../dish-filter/dish-filter.component';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { EmptyComponent } from '@/app/components/empty/empty.component';
import { DishService } from '@/app/service/dish.service';
import { DishCardComponent } from '@/app/module/client/dish/dish-card/dish-card.component';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dish-basic',
  imports: [
    CommonModule,
    MatButtonModule,
    DishFilterComponent,
    MatIconModule,
    MatExpansionModule,
    EmptyComponent,
    DishCardComponent,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dish-basic.component.html',
  styleUrl: './dish-basic.component.scss',
})
export class DishBasicComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private dishService = inject(DishService);

  loading = signal(false);
  dishes = signal<Dish[]>([]);
  currentPage = signal(1);
  limit = signal(10);
  total = signal(0);
  dto: QueryDishDto = {};

  ngOnInit(): void {
    this.setupMetaTags();
    this.getDishes();
  }

  getDishes() {
    this.loading.set(true);
    this.dishService
      .findWithFuzzy({ ...this.dto, limit: this.limit(), page: this.currentPage() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((res) => {
        this.dishes.set(res.data);
        this.total.set(res.count);
      });
  }

  setupMetaTags(): void {
    this.titleService.setTitle(
      $localize`The Ultimate Food Guide: What to Eat Now`
    );
    this.metaService.updateTag({
      name: 'description',
      content: $localize`Hungry? Discover delicious dishes, restaurant recommendations, and food guides
            for every craving. Find your next meal!`,
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'ăn gì, what to eat, eat what, ăn chi',
    });
    this.metaService.updateTag({ name: 'robots', content: 'index,follow' });
  }

  goBack() {
    window.history.back();
  }

  onSearch(dto: QueryDishDto) {
    this.dto = dto;
    this.getDishes();
  }

  paginatorChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.getDishes();
  }
}
