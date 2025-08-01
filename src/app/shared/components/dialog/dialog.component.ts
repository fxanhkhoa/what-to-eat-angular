import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-content">
      <div class="flex justify-between items-center mb-4" *ngIf="title">
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <button 
          *ngIf="showClose" 
          mat-icon-button 
          (click)="close()"
          class="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .dialog-content {
      padding: 24px;
      min-width: 300px;
    }
  `]
})
export class DialogComponent {
  @Input() title: string = '';
  @Input() showClose: boolean = true;
  @Output() closed = new EventEmitter<void>();

  constructor(
    private dialogRef: MatDialogRef<DialogComponent>
  ) {}

  close(): void {
    this.closed.emit();
    this.dialogRef.close();
  }
}
