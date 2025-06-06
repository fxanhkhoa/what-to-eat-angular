import { IngredientService } from '@/app/service/ingredient.service';
import { Ingredient } from '@/types/ingredient.type';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-ingredient-section',
  imports: [MatProgressSpinnerModule, CommonModule],
  templateUrl: './ingredient-section.component.html',
  styleUrl: './ingredient-section.component.scss',
})
export class IngredientSectionComponent implements OnInit {
  private ingredientService = inject(IngredientService);

  isLoading = false;
  ingredients: Ingredient[] = [];

  ngOnInit(): void {}

  getIngredients() {
    this.isLoading = true;
    this.ingredientService
      .findRandom(12)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((res) => (this.ingredients = res));
  }
}
