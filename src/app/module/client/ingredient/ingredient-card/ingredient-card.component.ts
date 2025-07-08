import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { Ingredient } from '@/types/ingredient.type';
import {
  Component,
  inject,
  Input,
  LOCALE_ID,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CategoryBadgesComponent } from "../../../../shared/component/category-badges/category-badges.component";

@Component({
  selector: 'app-ingredient-card',
  imports: [MultiLanguagePipe, MatCardModule, CategoryBadgesComponent],
  templateUrl: './ingredient-card.component.html',
  styleUrl: './ingredient-card.component.scss',
})
export class IngredientCardComponent implements OnInit {
  @Input() ingredient!: Ingredient;

  localeId = inject(LOCALE_ID);

  backgroundList = [
    '/assets/images/food-card-bg-1.jpg',
    '/assets/images/food-card-bg-2.jpg',
    '/assets/images/food-card-bg-3.jpg',
    '/assets/images/food-card-bg-4.png',
  ];

  selectedBackground = signal('');
  flipCard = signal(false);

  ngOnInit(): void {
    const randomIndex = Math.floor(Math.random() * this.backgroundList.length);
    this.selectedBackground.set(
      `background-image: url("${this.backgroundList[randomIndex]}") !important;`
    );
  }

  toggleFlipCard() {
    this.flipCard.set(!this.flipCard());
  }
}
