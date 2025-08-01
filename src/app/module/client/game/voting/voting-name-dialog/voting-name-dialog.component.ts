import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-voting-name-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-semibold mb-4">Let us know your name</h2>
      <form (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label i18n>Name</mat-label>
          <input
            matInput
            [(ngModel)]="name"
            name="name"
            required
            i18n-placeholder
            placeholder="Enter your name"
            class="min-h-14"
          />
          <mat-error *ngIf="!name.trim()">
            <span i18n>Name is required.</span>
          </mat-error>
        </mat-form-field>

        <button matButton="elevated" type="submit" [disabled]="!name.trim()">
          <mat-icon>check_circle</mat-icon>
          <span i18n>Submit</span>
        </button>
      </form>
    </div>
  `,
})
export class VotingNameDialogComponent {
  name: string = '';

  constructor(
    private dialogRef: MatDialogRef<VotingNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onSubmit(): void {
    if (this.name.trim()) {
      this.dialogRef.close(this.name.trim());
    }
  }
}
