import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Router, RouterModule } from '@angular/router';
import { Ingredient } from '@/types/ingredient.type';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { ToastService } from '@/app/shared/service/toast.service';

@Component({
  selector: 'app-admin-ingredient-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    RouterModule,
    CategoryTranslatePipe,
  ],
  templateUrl: './admin-ingredient-detail-dialog.component.html',
  styleUrl: './admin-ingredient-detail-dialog.component.scss',
})
export class AdminIngredientDetailDialogComponent {
  readonly ingredient = inject<Ingredient>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<AdminIngredientDetailDialogComponent>);
  private router = inject(Router);
  private toastService = inject(ToastService);

  activeImageIndex = 0;

  get currentImage(): string {
    if (this.ingredient?.images && this.ingredient.images.length > 0) {
      return this.ingredient.images[this.activeImageIndex] || this.ingredient.images[0];
    }
    return '/assets/images/placeholder.png';
  }

  get englishTitle(): string {
    const en = this.ingredient?.title?.find((t) => t.lang === 'en');
    return en ? en.data : this.ingredient?.title?.[0]?.data || 'Unnamed Ingredient';
  }

  get proteinCalories(): number {
    return (this.ingredient?.protein || 0) * 4;
  }

  get carbCalories(): number {
    return (this.ingredient?.carbohydrate || 0) * 4;
  }

  get fatCalories(): number {
    return (this.ingredient?.fat || 0) * 9;
  }

  get totalMacroCalories(): number {
    return this.proteinCalories + this.carbCalories + this.fatCalories;
  }

  get proteinPercent(): number {
    if (!this.totalMacroCalories) return 0;
    return Math.round((this.proteinCalories / this.totalMacroCalories) * 100);
  }

  get carbPercent(): number {
    if (!this.totalMacroCalories) return 0;
    return Math.round((this.carbCalories / this.totalMacroCalories) * 100);
  }

  get fatPercent(): number {
    if (!this.totalMacroCalories) return 0;
    return Math.max(0, 100 - this.proteinPercent - this.carbPercent);
  }

  copySlug(): void {
    if (this.ingredient?.slug && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(this.ingredient.slug);
      this.toastService.showSuccess($localize`Copied`, $localize`Slug copied to clipboard`, 2000);
    }
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/images/placeholder.png';
  }

  editIngredient(): void {
    this.dialogRef.close();
    this.router.navigate(['/admin/ingredient', this.ingredient._id]);
  }

  close(): void {
    this.dialogRef.close();
  }
}
