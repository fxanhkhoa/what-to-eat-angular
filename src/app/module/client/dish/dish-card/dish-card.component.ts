import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { DIFFICULT_LEVELS } from '@/enum/dish.enum';
import { Dish } from '@/types/dish.type';
import { UserFavoriteService } from '@/app/service/user-favorite.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  LOCALE_ID,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ToastService } from '@/app/shared/service/toast.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShareBottomSheetComponent } from '@/app/shared/components/share-bottom-sheet/share-bottom-sheet.component';

@Component({
  selector: 'app-dish-card',
  imports: [
    MatIconModule,
    MultiLanguagePipe,
    CategoryTranslatePipe,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './dish-card.component.html',
  styleUrl: './dish-card.component.scss',
})
export class DishCardComponent implements OnInit {
  @Input() dish!: Dish;
  @Input() newTab = false;

  localeId = inject<string>(LOCALE_ID);
  private userFavoriteService = inject(UserFavoriteService);
  private toastr = inject(ToastService);
  private bottomSheet = inject(MatBottomSheet);

  readonly DIFFICULT_LEVELS = DIFFICULT_LEVELS;

  isFavorite = signal(false);
  isLoadingFavorite = signal(false);

  ngOnInit(): void {
    this.checkIsFavorite();
  }

  getTotalTime(): number {
    return (this.dish?.preparationTime || 0) + (this.dish?.cookingTime || 0);
  }

  private checkIsFavorite(): void {
    this.userFavoriteService.checkIsFavorite(this.dish.slug).subscribe({
      next: (response) => {
        this.isFavorite.set(response.isFavorite);
      },
      error: () => {
        this.isFavorite.set(false);
      },
    });
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    this.isLoadingFavorite.set(true);

    if (this.isFavorite()) {
      this.userFavoriteService.removeFavorite(this.dish.slug).subscribe({
        next: () => {
          this.isFavorite.set(false);
          this.toastr.showSuccess('Success', 'Removed from favorites');
          this.isLoadingFavorite.set(false);
        },
        error: () => {
          this.toastr.showError('Error', 'Failed to remove from favorites');
          this.isLoadingFavorite.set(false);
        },
      });
    } else {
      this.userFavoriteService
        .addFavorite({
          userId: '', // Will be set by backend from token
          dishId: this.dish._id,
          dishSlug: this.dish.slug,
        })
        .subscribe({
          next: () => {
            this.isFavorite.set(true);
            this.toastr.showSuccess('Success', 'Added to favorites');
            this.isLoadingFavorite.set(false);
          },
          error: () => {
            this.toastr.showError('Error', 'Failed to add to favorites');
            this.isLoadingFavorite.set(false);
          },
        });
    }
  }

  openShareSheet(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.bottomSheet.open(ShareBottomSheetComponent, {
      data: { dish: this.dish },
    });
  }
}
