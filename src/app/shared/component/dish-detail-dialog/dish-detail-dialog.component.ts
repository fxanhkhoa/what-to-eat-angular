import { Component, inject, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Dish } from '@/types/dish.type';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dish-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MultiLanguagePipe,
    RouterModule,
  ],
  templateUrl: './dish-detail-dialog.component.html',
  styleUrl: './dish-detail-dialog.component.scss',
})
export class DishDetailDialogComponent {
  dialogRef = inject(MatDialogRef<DishDetailDialogComponent>);
  data: Dish = inject(MAT_DIALOG_DATA);
  localeId = inject(LOCALE_ID);

  close(): void {
    this.dialogRef.close();
  }

  getTotalTime(): number | null {
    const prep = this.data.preparationTime || 0;
    const cook = this.data.cookingTime || 0;
    return prep + cook > 0 ? prep + cook : null;
  }
}
