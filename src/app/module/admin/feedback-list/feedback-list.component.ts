import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FeedbackService } from '@/app/service/feedback.service';
import { Feedback, FeedbackListDto } from '@/types/feedback.type';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.scss'],
})
export class FeedbackListComponent implements OnInit {
  private feedbackService = inject(FeedbackService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  feedbacks = signal<Feedback[]>([]);
  isLoading = signal(false);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  filters: FeedbackListDto = {
    page: 1,
    limit: 10,
  };

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.isLoading.set(true);
    
    this.feedbackService.findAll(this.filters).subscribe({
      next: (response) => {
        this.feedbacks.set(response.data);
        this.totalItems.set(response.metadata.totalItems);
        this.currentPage.set(response.metadata.currentPage);
        this.pageSize.set(response.metadata.itemsPerPage);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load feedbacks', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadFeedbacks();
  }

  clearEmailFilter(): void {
    this.filters.email = undefined;
    this.onFilterChange();
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: this.pageSize(),
    };
    this.loadFeedbacks();
  }

  onPageChange(event: PageEvent): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.loadFeedbacks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewDetails(feedback: Feedback): void {
    // Could open a dialog with full details
    this.snackBar.open(`Viewing feedback from ${feedback.email}`, 'Close', {
      duration: 3000,
    });
  }

  deleteFeedback(id: string): void {
    if (confirm('Are you sure you want to delete this feedback?')) {
      this.feedbackService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Feedback deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.loadFeedbacks();
        },
        error: () => {
          this.snackBar.open('Failed to delete feedback', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }
}
