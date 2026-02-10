import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { DishService } from '@/app/service/dish.service';
import { AuthService } from '@/app/service/auth.service';
import { GameStateService } from '@/app/state/game-state.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { UserDishCollection } from '@/types/user-dish-collection.type';
import { Dish } from '@/types/dish.type';
import { EmptyComponent } from '@/app/components/empty/empty.component';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-wheel-collection-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatCardModule,
    MatChipsModule,
    EmptyComponent,
  ],
  templateUrl: './wheel-collection-picker.component.html',
  styleUrl: './wheel-collection-picker.component.scss',
})
export class WheelCollectionPickerComponent implements OnInit {
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
      .pipe(take(2))
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
          console.log('Loaded collections:', response.data);
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
        2000,
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
              this.replaceWheelDishes(dishes, collection.name);
              this.loadingDishes.set(false);
            }
          },
          error: () => {
            loadedCount++;
            if (loadedCount === collection.dishSlugs.length) {
              if (dishes.length > 0) {
                this.replaceWheelDishes(dishes, collection.name);
              }
              this.loadingDishes.set(false);
            }
          },
        });
    });
  }

  replaceWheelDishes(dishes: Dish[], collectionName: string): void {
    this.gameStateService.updateWheelOfFortuneState({
      selectedItem: null,
      items: dishes,
    });

    this.toastService.showSuccess(
      $localize`Collection Loaded`,
      $localize`${dishes.length} dishes from "${collectionName}" added to wheel`,
      2000,
    );
  }

  getCollectionIcon(icon: string | undefined): string {
    return icon || 'cake';
  }

  getCollectionColor(color: string | undefined): string {
    return color || '#3b82f6';
  }
}
