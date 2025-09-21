import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Contact } from '@/types/contact.type';

@Component({
  selector: 'app-contact-details-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './contact-details-dialog.component.html',
  styleUrl: './contact-details-dialog.component.scss'
})
export class ContactDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ContactDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Contact
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
