import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeedbackService } from '@/app/service/feedback.service';
import { CreateFeedbackDto } from '@/types/feedback.type';
import { ToastService } from '@/app/shared/service/toast.service';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
})
export class FeedbackFormComponent {
  private fb = inject(FormBuilder);
  private feedbackService = inject(FeedbackService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<FeedbackFormComponent>);
  private toastService = inject(ToastService);

  selectedRating = signal(0);
  hoverRating = signal(0);
  isSubmitting = signal(false);

  feedbackForm: FormGroup;

  constructor() {
    this.feedbackForm = this.fb.group({
      userName: [''],
      email: ['', [Validators.email]],
      rating: [0, [Validators.required, Validators.min(1)]],
      comment: ['', [Validators.minLength(10), Validators.maxLength(1000)]],
      page: [this.getCurrentPage()],
    });
  }

  setRating(rating: number): void {
    this.selectedRating.set(rating);
    this.feedbackForm.patchValue({ rating });
    this.feedbackForm.get('rating')?.markAsTouched();
  }

  getCurrentPage(): string {
    return window.location.pathname;
  }

  submitFeedback(): void {
    if (this.feedbackForm.invalid) {
      Object.keys(this.feedbackForm.controls).forEach((key) => {
        this.feedbackForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    const feedbackData: CreateFeedbackDto = {
      ...this.feedbackForm.value,
      userAgent: navigator.userAgent,
    };

    this.feedbackService.create(feedbackData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.showSuccess(
          $localize`success`,
          $localize`Thank you for your feedback! 🎉`,
          1500
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const errorMessage =
          error?.error?.error || 'Failed to submit feedback. Please try again.';
        this.toastService.showError($localize`error`, errorMessage, 2000);
      },
    });
  }
}
