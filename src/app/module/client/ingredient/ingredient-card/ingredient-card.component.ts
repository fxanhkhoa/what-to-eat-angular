import { Ingredient } from '@/types/ingredient.type';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ingredient-card',
  imports: [],
  templateUrl: './ingredient-card.component.html',
  styleUrl: './ingredient-card.component.scss',
})
export class IngredientCardComponent {
  @Input() ingredient!: Ingredient;
}
