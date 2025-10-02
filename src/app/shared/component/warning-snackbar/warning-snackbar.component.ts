import { Component, Inject, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-warning-snackbar',
  imports: [MatIconModule],
  templateUrl: './warning-snackbar.component.html',
  styleUrl: './warning-snackbar.component.scss',
})
export class WarningSnackbarComponent {
  snackBarRef = inject(MatSnackBarRef);
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: { mainMsg: string; subMsg: string }
  ) {}
}
