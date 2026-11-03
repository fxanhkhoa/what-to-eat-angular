import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { IngredientService } from '@/app/service/ingredient.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { AvailableLanguages } from '@/constant/language.constant';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';
import { MultiLanguage } from '@/types/base.type';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from '@/types/ingredient.type';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { ImageViewerComponent } from '@/app/shared/widget/image-viewer/image-viewer.component';

@Component({
  selector: 'app-admin-ingredient-update',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule,
    CategoryTranslatePipe,
  ],
  templateUrl: './admin-ingredient-update.component.html',
  styleUrl: './admin-ingredient-update.component.scss',
})
export class AdminIngredientUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ingredientService = inject(IngredientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);

  ingredientForm: FormGroup = new FormGroup([]);
  availableLanguages = AvailableLanguages;
  ingredientCategoriesArray = Object.values(INGREDIENT_CATEGORIES);
  isLoading = false;
  isSaving = false;
  ingredientId?: string;
  loadedIngredientTitle: string = '';

  newImageUrl: string = '';

  popularCategories: string[] = [
    INGREDIENT_CATEGORIES.VEGETABLES,
    INGREDIENT_CATEGORIES.PROTEIN_FOODS,
    INGREDIENT_CATEGORIES.FRUIT,
    INGREDIENT_CATEGORIES.GRAINS,
    INGREDIENT_CATEGORIES.MILK_AND_DAIRY,
    INGREDIENT_CATEGORIES.HERBS_AND_SPICES,
    INGREDIENT_CATEGORIES.CONDIMENTS_AND_SAUCES,
    INGREDIENT_CATEGORIES.FATS_AND_OILS,
  ];

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.ingredientId = id;
      if (id && id !== 'create') {
        this.isLoading = true;
        this.ingredientService
          .findOne(id)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: (res) => {
              this.ingredientForm.patchValue({
                slug: res.slug,
                measure: res.measure,
                calories: res.calories,
                carbohydrate: res.carbohydrate,
                fat: res.fat,
                ingredientCategory: res.ingredientCategory || [],
                weight: res.weight,
                protein: res.protein,
                cholesterol: res.cholesterol,
                sodium: res.sodium,
              });

              this.titleArray.clear();
              if (res.title && res.title.length > 0) {
                res.title.forEach((title) => {
                  this.titleArray.push(this.createLanguageControl(title));
                });
                const en = res.title.find((t) => t.lang === 'en');
                this.loadedIngredientTitle = en ? en.data : res.title[0]?.data || '';
              } else {
                this.addDefaultLanguages();
              }

              this.imagesArray.clear();
              if (res.images && res.images.length > 0) {
                res.images.forEach((image) => {
                  this.imagesArray.push(
                    this.fb.control(image, Validators.required)
                  );
                });
              }
            },
            error: () => {
              this.toastService.showError(
                $localize`Error`,
                $localize`Failed to load ingredient details`,
                3000
              );
            },
          });
      } else {
        // Default languages for creation
        this.addDefaultLanguages();
      }
    });
  }

  initForm(): void {
    this.ingredientForm = this.fb.group({
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      title: this.fb.array([]),
      measure: [''],
      calories: [null, [Validators.min(0)]],
      carbohydrate: [null, [Validators.min(0)]],
      fat: [null, [Validators.min(0)]],
      ingredientCategory: [[], [Validators.required]],
      weight: [null, [Validators.min(0)]],
      protein: [null, [Validators.min(0)]],
      cholesterol: [null, [Validators.min(0)]],
      sodium: [null, [Validators.min(0)]],
      images: this.fb.array([]),
    });
  }

  addDefaultLanguages(): void {
    if (this.titleArray.length === 0) {
      this.titleArray.push(this.createLanguageControl({ lang: 'en', data: '' }));
      this.titleArray.push(this.createLanguageControl({ lang: 'vi', data: '' }));
    }
  }

  createLanguageControl(
    title: MultiLanguage<string> = { lang: '', data: '' }
  ): FormGroup {
    return this.fb.group({
      lang: [title.lang || 'en', Validators.required],
      data: [title.data || '', Validators.required],
    });
  }

  get titleArray(): FormArray {
    return this.ingredientForm.get('title') as FormArray;
  }

  get imagesArray(): FormArray {
    return this.ingredientForm.get('images') as FormArray;
  }

  addLanguage(): void {
    // Default to a language that hasn't been added yet, if any
    const existing = this.titleArray.controls.map((c) => c.get('lang')?.value);
    const unused = this.availableLanguages.find((l) => !existing.includes(l));
    this.titleArray.push(this.createLanguageControl({ lang: unused || 'en', data: '' }));
  }

  removeLanguage(index: number): void {
    if (this.titleArray.length > 1) {
      this.titleArray.removeAt(index);
    } else {
      this.toastService.showWarning($localize`Notice`, $localize`At least one title translation is required`, 2500);
    }
  }

  addImage(url: string = ''): void {
    this.imagesArray.push(this.fb.control(url, Validators.required));
  }

  addImageFromInput(): void {
    const url = this.newImageUrl.trim();
    if (url) {
      this.addImage(url);
      this.newImageUrl = '';
    }
  }

  removeImage(index: number): void {
    this.imagesArray.removeAt(index);
  }

  setPrimaryImage(index: number): void {
    if (index > 0 && index < this.imagesArray.length) {
      const control = this.imagesArray.at(index);
      this.imagesArray.removeAt(index);
      this.imagesArray.insert(0, control);
      this.toastService.showSuccess($localize`Updated`, $localize`Image set as primary`, 2000);
    }
  }

  generateSlug(): void {
    // Look for english title, or first non-empty title
    const en = this.titleArray.controls.find((c) => c.get('lang')?.value === 'en');
    const titleVal = en?.get('data')?.value || this.titleArray.controls[0]?.get('data')?.value;

    if (!titleVal) {
      this.toastService.showWarning(
        $localize`Warning`,
        $localize`Please enter an ingredient title before generating a slug`,
        2500
      );
      return;
    }

    const slug = titleVal
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

    this.ingredientForm.get('slug')?.setValue(slug);
    this.ingredientForm.get('slug')?.markAsDirty();
  }

  quickToggleCategory(category: string): void {
    const current = (this.ingredientForm.get('ingredientCategory')?.value as string[]) || [];
    let updated: string[];
    if (current.includes(category)) {
      updated = current.filter((c) => c !== category);
    } else {
      updated = [...current, category];
    }
    this.ingredientForm.get('ingredientCategory')?.setValue(updated);
    this.ingredientForm.get('ingredientCategory')?.markAsDirty();
  }

  isCategoryActive(category: string): boolean {
    const current = (this.ingredientForm.get('ingredientCategory')?.value as string[]) || [];
    return current.includes(category);
  }

  previewImageModal(url: string): void {
    if (url) {
      this.dialog.open(ImageViewerComponent, {
        data: url,
        width: '80%',
        maxWidth: '1200px',
        autoFocus: false,
      });
    }
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/images/placeholder.png';
  }

  // --- Real-time preview getters ---
  get previewTitle(): string {
    const en = this.titleArray.controls.find((c) => c.get('lang')?.value === 'en');
    const val = en?.get('data')?.value || this.titleArray.controls[0]?.get('data')?.value;
    return val || 'Ingredient Name';
  }

  get previewImage(): string {
    const first = this.imagesArray.at(0)?.value;
    return first || '/assets/images/placeholder.png';
  }

  get previewCalories(): number {
    return this.ingredientForm.get('calories')?.value || 0;
  }

  get previewProtein(): number {
    return this.ingredientForm.get('protein')?.value || 0;
  }

  get previewCarbs(): number {
    return this.ingredientForm.get('carbohydrate')?.value || 0;
  }

  get previewFat(): number {
    return this.ingredientForm.get('fat')?.value || 0;
  }

  get previewMeasure(): string {
    return this.ingredientForm.get('measure')?.value || '1 serving';
  }

  get previewWeight(): number | null {
    return this.ingredientForm.get('weight')?.value;
  }

  get previewCategories(): string[] {
    return this.ingredientForm.get('ingredientCategory')?.value || [];
  }

  get macroTotalCalories(): number {
    return this.previewProtein * 4 + this.previewCarbs * 4 + this.previewFat * 9;
  }

  get proteinPercent(): number {
    if (!this.macroTotalCalories) return 0;
    return Math.round(((this.previewProtein * 4) / this.macroTotalCalories) * 100);
  }

  get carbPercent(): number {
    if (!this.macroTotalCalories) return 0;
    return Math.round(((this.previewCarbs * 4) / this.macroTotalCalories) * 100);
  }

  get fatPercent(): number {
    if (!this.macroTotalCalories) return 0;
    return Math.max(0, 100 - this.proteinPercent - this.carbPercent);
  }

  onSubmit(): void {
    if (this.ingredientForm.valid) {
      this.isSaving = true;
      const formValue = this.ingredientForm.value;

      if (this.ingredientId && this.ingredientId !== 'create') {
        const ingredient: UpdateIngredientDto = {
          ...formValue,
          ingredientCategory: Array.isArray(formValue.ingredientCategory)
            ? formValue.ingredientCategory
            : [formValue.ingredientCategory],
          id: this.ingredientId,
        };

        this.ingredientService
          .update(this.ingredientId, ingredient)
          .pipe(finalize(() => (this.isSaving = false)))
          .subscribe({
            next: () => {
              this.toastService.showSuccess(
                $localize`Updated`,
                $localize`Ingredient updated successfully`,
                1500
              );
              this.router.navigate(['/admin/ingredient']);
            },
            error: () => {
              this.toastService.showError(
                $localize`Error`,
                $localize`Failed to update ingredient`,
                3000
              );
            },
          });
        return;
      }

      const ingredient: CreateIngredientDto = {
        ...formValue,
        ingredientCategory: Array.isArray(formValue.ingredientCategory)
          ? formValue.ingredientCategory
          : [formValue.ingredientCategory],
      };

      this.ingredientService
        .create(ingredient)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: () => {
            this.toastService.showSuccess(
              $localize`Created`,
              $localize`Ingredient created successfully`,
              1500
            );
            this.router.navigate(['/admin/ingredient']);
          },
          error: () => {
            this.toastService.showError(
              $localize`Error`,
              $localize`Failed to create ingredient`,
              3000
            );
          },
        });
    } else {
      this.markFormGroupTouched(this.ingredientForm);
      this.toastService.showWarning(
        $localize`Validation Error`,
        $localize`Please complete all required fields correctly`,
        3000
      );
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((c) => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/ingredient']);
  }
}
