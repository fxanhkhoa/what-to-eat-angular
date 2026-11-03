import { Component, inject, OnInit, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { DishService } from '@/app/service/dish.service';
import { AuthService } from '@/app/service/auth.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { UserDishCollection } from '@/types/user-dish-collection.type';
import { Dish } from '@/types/dish.type';
import { EmptyComponent } from '@/app/components/empty/empty.component';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-voting-collection-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    EmptyComponent,
  ],
  templateUrl: './voting-collection-picker.component.html',
  styleUrl: './voting-collection-picker.component.scss',
})
export class VotingCollectionPickerComponent implements OnInit {
  private collectionService = inject(UserDishCollectionService);
  private dishService = inject(DishService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Output event to notify parent component about selected dishes
  dishesSelected = output<Dish[]>();

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
              this.addCollectionDishes(dishes, collection.name);
              this.loadingDishes.set(false);
            }
          },
          error: () => {
            loadedCount++;
            if (loadedCount === collection.dishSlugs.length) {
              if (dishes.length > 0) {
                this.addCollectionDishes(dishes, collection.name);
              }
              this.loadingDishes.set(false);
            }
          },
        });
    });
  }

  addCollectionDishes(dishes: Dish[], collectionName: string): void {
    // Emit the dishes to parent component to handle adding them
    this.dishesSelected.emit(dishes);

    this.toastService.showSuccess(
      $localize`Collection Loaded`,
      $localize`${dishes.length} dishes from "${collectionName}" ready to add`,
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
