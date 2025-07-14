import { Dish } from '@/types/dish.type';
import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DishCardComponent } from '../../dish/dish-card/dish-card.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-selected-dish-modal',
  imports: [MatIconModule, DishCardComponent, MatButtonModule],
  templateUrl: './selected-dish-modal.component.html',
  styleUrl: './selected-dish-modal.component.scss',
})
export class SelectedDishModalComponent {
  readonly dialogRef = inject(MatDialogRef<SelectedDishModalComponent>);
  readonly data = inject<Dish>(MAT_DIALOG_DATA);
}
