import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
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
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ToastService } from '@/app/shared/service/toast.service';

@Component({
  selector: 'app-dish-card-fancy',
  imports: [
    CommonModule,
    MatCardModule,
    MultiLanguagePipe,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    CategoryTranslatePipe,
    RouterModule,
  ],
  templateUrl: './dish-card-fancy.component.html',
  styleUrl: './dish-card-fancy.component.scss',
})
export class DishCardFancyComponent implements OnInit {
  @Input() dish!: Dish;
  @Input() isWinner: boolean = false;

  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private userFavoriteService = inject(UserFavoriteService);
  private toastr = inject(ToastService);
  localeId = inject(LOCALE_ID);

  isFavorite = signal(false);
  isLoadingFavorite = signal(false);

  backgroundList = [
    '/assets/images/food-card-bg-1.jpg',
    '/assets/images/food-card-bg-2.jpg',
    '/assets/images/food-card-bg-3.jpg',
    '/assets/images/food-card-bg-4.png',
  ];

  selectedBackground = signal('');

  constructor() {
    this.iconRegistry.addSvgIcon(
      'easy',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/easy.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'medium',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/medium.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'hard',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/hard.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'cooking_time',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/cooking_time.svg',
      ),
    );
    this.iconRegistry.addSvgIcon(
      'preparation_time',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/preparation_time.svg',
      ),
    );
  }

  ngOnInit(): void {
    const randomIndex = Math.floor(Math.random() * this.backgroundList.length);
    this.selectedBackground.set(
      `background-image: url("${this.backgroundList[randomIndex]}") !important;`,
    );
    this.checkIsFavorite();
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
}
