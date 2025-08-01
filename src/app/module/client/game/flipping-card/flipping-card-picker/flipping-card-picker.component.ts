import { Component, inject, OnInit, signal } from '@angular/core';
import { DishFilterComponent } from '../../../dish/dish-filter/dish-filter.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DishCardComponent } from '../../../dish/dish-card/dish-card.component';
import { EmptyComponent } from '@/app/components/empty/empty.component';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { GameStateService } from '@/app/state/game-state.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { DishService } from '@/app/service/dish.service';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-flipping-card-picker',
  imports: [
    DishFilterComponent,
    CommonModule,
    DishCardComponent,
    MatButtonModule,
    MatIconModule,
    EmptyComponent,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatPaginatorModule,
  ],
  templateUrl: './flipping-card-picker.component.html',
  styleUrl: './flipping-card-picker.component.scss',
})
export class FlippingCardPickerComponent implements OnInit {
  private gameStateService = inject(GameStateService);
  private dishService = inject(DishService);
  private toastService = inject(ToastService);

  currentPage = signal(1);
  limit = signal(10);
  total = signal(0);
  loading = signal(false);
  dto: QueryDishDto = {};
  dishes = signal<Dish[]>([]);

  ngOnInit(): void {
    this.getDishes();
  }

  addDish(dish: Dish) {
    this.gameStateService
      .getGameState()
      .pipe(take(1))
      .subscribe((state) => {
        this.gameStateService.updateFlippingCardState({
          ...state.flippingCard,
          items: [...state.flippingCard.items, dish],
        });

        this.toastService.showSuccess(
          $localize`Success`,
          $localize`Dish added!`,
          1500
        );
      });
  }

  getDishes() {
    this.loading.set(true);
    this.dishService
      .findAll({ ...this.dto, limit: this.limit(), page: this.currentPage() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((res) => {
        this.dishes.set(res.data);
        this.total.set(res.count);
      });
  }

  paginatorChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.getDishes();
  }

  onSearch(dto: QueryDishDto) {
    this.dto = dto;
    this.getDishes();
  }
}
