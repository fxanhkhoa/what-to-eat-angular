import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-error-snackbar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './error-snackbar.component.html',
  styleUrl: './error-snackbar.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ErrorSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data?: { mainMsg: string; subMsg: string },
    private snackRef?: MatSnackBarRef<ErrorSnackbarComponent>
  ) {}

  close() {
    this.snackRef?.dismiss();
  }
}
