import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-snackbar',
  standalone: true,
  imports: [MatIconModule, TranslateModule, MatButtonModule],
  templateUrl: './confirm-snackbar.component.html',
  styleUrl: './confirm-snackbar.component.scss',
})
export class ConfirmSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<ConfirmSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA)
    public data: { mainMsg: string; subMsg: string }
  ) {}

  onCancel() {
    this.snackBarRef.dismiss();
  }

  onConfirm() {}
}
