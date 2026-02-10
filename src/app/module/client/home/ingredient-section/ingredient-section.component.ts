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
  signal,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { CategoryTranslatePipe } from "@/app/pipe/category-translate.pipe";

type ButtonPosition = {
  top: number;
  left: number;
};

@Component({
  selector: 'app-ingredient-section',
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatBadgeModule,
    CategoryTranslatePipe
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

  isLoading = signal(false);
  ingredients = signal<Ingredient[]>([]);
  ingredientCategories: string[] = Object.values(INGREDIENT_CATEGORIES);
  ingredientCategoryIcons: string[] = [];
  selectedIngredientCategories = signal<string[]>([]);
  hoveredIndex = signal<number | null>(null);

  constructor() {
    this.ingredientCategories.forEach((category) => {
      const icon = category.replaceAll(' ', '_').toLowerCase();
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`/assets/icons/${icon}.svg`)
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
    this.isLoading.set(true);
    this.stopScrollAnimation();
    this.ingredientService
      .findRandom(12, this.selectedIngredientCategories())
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          setTimeout(() => this.startScrollAnimation(), 1000);
        })
      )
      .subscribe((res) => this.ingredients.set(res));
  }

  selectIngredientCategory(category: string) {
    const current = this.selectedIngredientCategories();
    if (current.includes(category)) {
      this.selectedIngredientCategories.set(
        current.filter((item) => item !== category)
      );
    } else {
      this.selectedIngredientCategories.set([...current, category]);
    }

    this.getIngredients();
  }

  isSelected(category: string) {
    return this.selectedIngredientCategories().includes(category);
  }

  getIngredientTitle(ingredient: Ingredient): string {
    return ingredient.title.find((t) => t.lang === this.localeId)?.data || '';
  }

  get images() {
    const ingredients = this.ingredients();
    if (!ingredients) return [];
    return ingredients.map((item) => ({
      src: item.images[0],
      title: item.title.find((t) => t.lang === this.localeId)?.data,
    }));
  }

  onImageLoad(index: number): void {
    // Handle image load if needed
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

  resetFilters() {
    this.selectedIngredientCategories.set([]);
    this.getIngredients();
  }
}
