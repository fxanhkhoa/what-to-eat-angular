import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DishVoteItem } from '@/types/dish-vote.type';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-custom-dish',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-custom-dish.component.html',
  styleUrl: './add-custom-dish.component.scss',
})
export class AddCustomDishComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject<
    MatDialogRef<AddCustomDishComponent, DishVoteItem>
  >(MatDialogRef<AddCustomDishComponent, DishVoteItem>);

  dishVoteItemForm: FormGroup = this.fb.group({
    customTitle: ['', [Validators.required, Validators.minLength(2)]],
    url: [''],
  });

  onSubmit() {
    if (this.dishVoteItemForm.valid) {
      const formValue = this.dishVoteItemForm.value;

      const dishVoteItem: DishVoteItem = {
        slug: formValue.url,
        customTitle: formValue.customTitle,
        voteUser: [],
        voteAnonymous: [],
        isCustom: true,
      };

      this.resetForm();

      this.dialogRef.close(dishVoteItem);
    }
  }

  onCancel() {
    this.resetForm();
    this.dialogRef.close();
  }

  private resetForm() {
    this.dishVoteItemForm.reset();
  }
}
