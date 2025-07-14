import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { DIFFICULT_LEVELS } from '@/enum/dish.enum';
import { Dish } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, LOCALE_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

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
  ],
  templateUrl: './dish-card.component.html',
  styleUrl: './dish-card.component.scss',
})
export class DishCardComponent {
  @Input() dish!: Dish;
  @Input() newTab = false;

  localeId = inject<string>(LOCALE_ID);

  readonly DIFFICULT_LEVELS = DIFFICULT_LEVELS;

  getTotalTime(): number {
    return (this.dish?.preparationTime || 0) + (this.dish?.cookingTime || 0);
  }
}
