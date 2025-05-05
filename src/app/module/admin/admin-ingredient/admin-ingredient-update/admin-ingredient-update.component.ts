import { IngredientService } from '@/app/service/ingredient.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { AvailableLanguages } from '@/constant/language.constant';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';
import { MultiLanguage } from '@/types/base.type';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from '@/types/ingredient.type';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-ingredient-update',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
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

  ingredientForm: FormGroup = new FormGroup([]);
  availableLanguages = AvailableLanguages; // Add your supported languages
  ingredientCategoriesArray = Object.values(INGREDIENT_CATEGORIES);
  isLoading = false;
  ingredientId?: string;

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
          .subscribe((res) => {
            this.ingredientForm.patchValue(res);
            res.title.forEach((title) => {
              this.titleArray.push(this.createLanguageControl(title));
            });
            res.images.forEach((image) => {
              this.imagesArray.push(
                this.fb.control(image, Validators.required)
              );
            });
          });
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

  createLanguageControl(
    title: MultiLanguage<string> = { lang: '', data: '' }
  ): FormGroup {
    return this.fb.group({
      lang: [title.lang, Validators.required],
      data: [title.data, Validators.required],
    });
  }

  get titleArray(): FormArray {
    return this.ingredientForm.get('title') as FormArray;
  }

  get imagesArray(): FormArray {
    return this.ingredientForm.get('images') as FormArray;
  }

  addLanguage(): void {
    this.titleArray.push(this.createLanguageControl());
  }

  removeLanguage(index: number): void {
    this.titleArray.removeAt(index);
  }

  addImage(): void {
    this.imagesArray.push(this.fb.control('', Validators.required));
  }

  removeImage(index: number): void {
    this.imagesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.ingredientForm.valid) {
      this.isLoading = true;
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
          .subscribe((res) => {
            this.toastService.showSuccess(
              $localize`Updated`,
              $localize`Ingredient updated successfully`,
              1500
            );
            this.router.navigate(['/admin/ingredient']);
          });

        return;
      }

      const ingredient: CreateIngredientDto = {
        ...formValue,
        ingredientCategory: Array.isArray(formValue.ingredientCategory)
          ? formValue.ingredientCategory
          : [formValue.ingredientCategory],
      };

      this.isLoading = true;
      this.ingredientService
        .create(ingredient)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe((res) => {
          this.toastService.showSuccess(
            $localize`Created`,
            $localize`Ingredient created successfully`,
            1500
          );
          this.router.navigate(['/admin/ingredient']);
        });
    } else {
      this.markFormGroupTouched(this.ingredientForm);
    }
  }

  // Helper method to trigger validation on all form fields
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/ingredient']);
  }
}
