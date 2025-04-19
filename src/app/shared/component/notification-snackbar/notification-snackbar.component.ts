import { Component, Inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-notification-snackbar',
  templateUrl: './notification-snackbar.component.html',
  styleUrls: ['./notification-snackbar.component.scss'],
  imports: [MatIconModule],
})
export class NotificationSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: { mainMsg: string; subMsg: string; redirectUrl: string },
    private router: Router
  ) {}

  notificationClicked() {
    this.router.navigate([this.data.redirectUrl]);
  }
}
