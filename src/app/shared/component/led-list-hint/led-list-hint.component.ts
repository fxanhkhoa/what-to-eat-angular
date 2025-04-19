import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-led-list-hint',
  standalone: true,
  imports: [MatListModule, TranslateModule],
  templateUrl: './led-list-hint.component.html',
  styleUrl: './led-list-hint.component.scss',
})
export class LedListHintComponent {
  private dialogRef = inject(MatDialogRef<LedListHintComponent>);

  close() {
    this.dialogRef?.close();
  }
}
