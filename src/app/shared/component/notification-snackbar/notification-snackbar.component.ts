import { Component, Inject, ViewEncapsulation, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

const TYPE_ICONS: Record<string, string> = {
  chat: 'chat',
  activity: 'notifications_active',
  marketing: 'campaign',
};

const TYPE_ICON_CLASSES: Record<string, string> = {
  chat: 'icon-chat',
  activity: 'icon-activity',
  marketing: 'icon-marketing',
};

const TYPE_BAR_CLASSES: Record<string, string> = {
  chat: 'bar-chat',
  activity: 'bar-activity',
  marketing: 'bar-marketing',
};

export type NotificationSnackbarData = {
  mainMsg: string;
  subMsg: string;
  redirectUrl: string;
  type?: string;
  duration?: number;
};

@Component({
  selector: 'app-notification-snackbar',
  standalone: true,
  templateUrl: './notification-snackbar.component.html',
  styleUrls: ['./notification-snackbar.component.scss'],
  imports: [MatIconModule],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationSnackbarComponent {
  snackBarRef = inject(MatSnackBarRef);

  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: NotificationSnackbarData,
    private router: Router,
  ) {}

  get typeIcon(): string {
    return TYPE_ICONS[this.data.type ?? ''] ?? 'notifications';
  }

  get iconBgClass(): string {
    return TYPE_ICON_CLASSES[this.data.type ?? ''] ?? 'icon-default';
  }

  get barClass(): string {
    return TYPE_BAR_CLASSES[this.data.type ?? ''] ?? 'bar-default';
  }

  get animDuration(): string {
    return `${this.data.duration ?? 5000}ms`;
  }

  navigate() {
    this.snackBarRef.dismiss();
    if (this.data.redirectUrl) {
      this.router.navigate([this.data.redirectUrl]);
    }
  }

  dismiss(event: Event) {
    event.stopPropagation();
    this.snackBarRef.dismiss();
  }
}
