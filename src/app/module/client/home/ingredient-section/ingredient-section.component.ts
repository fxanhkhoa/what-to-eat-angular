import { IngredientService } from '@/app/service/ingredient.service';
import { Ingredient } from '@/types/ingredient.type';
import { CommonModule, isPlatformServer } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { MasonryGalleryComponent } from '@/app/shared/component/masonry-gallery/masonry-gallery.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

type ButtonPosition = {
  top: number;
  left: number;
};

@Component({
  selector: 'app-ingredient-section',
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
    MasonryGalleryComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './ingredient-section.component.html',
  styleUrl: './ingredient-section.component.scss',
})
export class IngredientSectionComponent implements OnInit, OnDestroy {
  private ingredientService = inject(IngredientService);
  private localeId = inject<string>(LOCALE_ID);
  private platformId = inject<string>(PLATFORM_ID);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('galleryContainer') galleryContainer!: ElementRef;
  Math = Math;

  scrollAnimationId: number | null = null;
  scrollDirection: 'down' | 'up' = 'down';
  carouselRotation = 0;
  rotationStep = 45;

  isLoading = false;
  ingredients: Ingredient[] = [];
  ingredientCategories: string[] = Object.values(INGREDIENT_CATEGORIES);
  ingredientCategoryIcons: string[] = [];
  selectedIngredientCategories: string[] = [];

  constructor() {
    this.ingredientCategories.forEach((category) => {
      const icon = category.replaceAll(' ', '_').toLowerCase();
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`/icons/${icon}.svg`)
      );
      this.ingredientCategoryIcons.push(icon);
    });
  }

  ngOnInit(): void {
    this.getIngredients();
  }

  ngOnDestroy(): void {
    this.stopScrollAnimation();
  }

  getIngredients() {
    this.isLoading = true;
    this.stopScrollAnimation();
    this.ingredientService
      .findRandom(12, this.selectedIngredientCategories)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          setTimeout(() => this.startScrollAnimation(), 1000);
        })
      )
      .subscribe((res) => (this.ingredients = res));
  }

  selectIngredientCategory(category: string) {
    if (this.selectedIngredientCategories.includes(category)) {
      this.selectedIngredientCategories =
        this.selectedIngredientCategories.filter((item) => item !== category);
    } else {
      this.selectedIngredientCategories.push(category);
    }

    this.getIngredients();
  }

  isSelected(category: string) {
    return this.selectedIngredientCategories.includes(category);
  }

  get images() {
    if (!this.ingredients) return [];
    return this.ingredients.map((item) => ({
      src: item.images[0],
      title: item.title.find((t) => t.lang === this.localeId)?.data,
    }));
  }

  startScrollAnimation(): void {
    if (isPlatformServer(this.platformId) || !window) return;
    const container = this.galleryContainer?.nativeElement;
    if (!container) return;
    this.scrollAnimationId = window.setInterval(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if we've reached the bottom
      if (
        scrollTop + clientHeight >= scrollHeight &&
        this.scrollDirection === 'down'
      ) {
        this.scrollDirection = 'up';
      }
      // Check if we've reached the top
      else if (scrollTop <= 0 && this.scrollDirection === 'up') {
        this.scrollDirection = 'down';
      }

      // Scroll by 1px in the current direction
      container.scrollTop += this.scrollDirection === 'down' ? 1 : -1;
    }, 50); // 0.1s interval
  }

  stopScrollAnimation(): void {
    if (this.scrollAnimationId !== null) {
      window.clearInterval(this.scrollAnimationId);
      this.scrollAnimationId = null;
    }
  }

  // Method to pause animation on hover/interaction
  pauseScrolling(): void {
    this.stopScrollAnimation();
  }

  // Method to resume animation when user stops interacting
  resumeScrolling(): void {
    this.startScrollAnimation();
  }

  pauseCarousel() {
    const carousel = document.querySelector('.curved-carousel');
    if (carousel) {
      carousel.classList.add('paused');
    }
  }

  resumeCarousel() {
    const carousel = document.querySelector('.curved-carousel');
    if (carousel) {
      carousel.classList.remove('paused');
    }
  }

  rotateCarousel(direction: 'left' | 'right'): void {
    // Calculate new rotation angle
    if (direction === 'left') {
      this.carouselRotation -= this.rotationStep;
    } else {
      this.carouselRotation += this.rotationStep;
    }

    // Normalize angle to stay within 0-360 range (optional)
    this.carouselRotation = this.carouselRotation % 360;
  }

  resetFilters() {
    this.selectedIngredientCategories = [];
    this.getIngredients();
  }
}
