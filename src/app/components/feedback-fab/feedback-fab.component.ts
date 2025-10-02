import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FeedbackFormComponent } from '../feedback-form/feedback-form.component';

@Component({
  selector: 'app-feedback-fab',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './feedback-fab.component.html',
  styleUrl: './feedback-fab.component.scss',
})
export class FeedbackFabComponent {
  private dialog = inject(MatDialog);

  openFeedbackForm(): void {
    this.dialog.open(FeedbackFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'feedback-dialog-container',
      disableClose: false,
      autoFocus: true,
    });
  }
}
