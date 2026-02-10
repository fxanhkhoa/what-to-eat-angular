import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { DishService } from '@/app/service/dish.service';
import { AuthService } from '@/app/service/auth.service';
import { GameStateService } from '@/app/state/game-state.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { UserDishCollection } from '@/types/user-dish-collection.type';
import { Dish } from '@/types/dish.type';
import { EmptyComponent } from '@/app/components/empty/empty.component';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-flipping-card-collection-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    EmptyComponent,
  ],
  templateUrl: './flipping-card-collection-picker.component.html',
  styleUrl: './flipping-card-collection-picker.component.scss',
})
export class FlippingCardCollectionPickerComponent implements OnInit {
  private collectionService = inject(UserDishCollectionService);
  private dishService = inject(DishService);
  private authService = inject(AuthService);
  private gameStateService = inject(GameStateService);
  private toastService = inject(ToastService);

  collections = signal<UserDishCollection[]>([]);
  loading = signal(false);
  loadingDishes = signal(false);
  userId = signal<string>('');

  ngOnInit(): void {
    this.authService
      .getProfile()
      .pipe(take(1))
      .subscribe((profile) => {
        if (profile?._id) {
          this.userId.set(profile._id);
          this.loadCollections();
        }
      });
  }

  loadCollections(): void {
    this.loading.set(true);
    this.collectionService
      .findAll({ userId: this.userId() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.collections.set(response.data || []);
        },
        error: () => {
          this.collections.set([]);
        },
      });
  }

  selectCollection(collection: UserDishCollection): void {
    if (!collection.dishSlugs || collection.dishSlugs.length === 0) {
      this.toastService.showWarning(
        $localize`Empty Collection`,
        $localize`This collection has no dishes`,
        2000
      );
      return;
    }

    this.loadingDishes.set(true);
    const dishes: Dish[] = [];
    let loadedCount = 0;

    collection.dishSlugs.forEach((slug) => {
      this.dishService
        .findBySlug(slug)
        .pipe(take(1))
        .subscribe({
          next: (dish) => {
            dishes.push(dish);
            loadedCount++;
            if (loadedCount === collection.dishSlugs.length) {
              this.replaceCardDishes(dishes, collection.name);
              this.loadingDishes.set(false);
            }
          },
          error: () => {
            loadedCount++;
            if (loadedCount === collection.dishSlugs.length) {
              if (dishes.length > 0) {
                this.replaceCardDishes(dishes, collection.name);
              }
              this.loadingDishes.set(false);
            }
          },
        });
    });
  }

  replaceCardDishes(dishes: Dish[], collectionName: string): void {
    this.gameStateService.updateFlippingCardState({
      selectedItem: null,
      items: dishes,
    });

    this.toastService.showSuccess(
      $localize`Collection Loaded`,
      $localize`${dishes.length} dishes from "${collectionName}" added to game`,
      2000
    );
  }

  getCollectionIcon(icon: string | undefined): string {
    return icon || 'cake';
  }

  getCollectionColor(color: string | undefined): string {
    return color || '#3b82f6';
  }
}
