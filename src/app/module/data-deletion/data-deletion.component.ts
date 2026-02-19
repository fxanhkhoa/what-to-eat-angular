import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, signal, Renderer2, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { JWTTokenPayload } from '@/types/auth.type';
import { UserService } from '@/app/service/user.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { AuthService } from '@/app/service/auth.service';
import { ConfirmDialogComponent } from '@/app/shared/component/confirm-dialog/confirm-dialog.component';
import { catchError, of, take } from 'rxjs';

@Component({
  selector: 'app-data-deletion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './data-deletion.component.html',
  styleUrl: './data-deletion.component.scss',
})
export class DataDeletionComponent implements OnDestroy {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  isDeleting = signal(false);
  userId = signal<string | null>(null);
  userName = signal<string | null>(null);

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'dark-theme');
    this.loadUserInfo();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'dark-theme');
  }

  private loadUserInfo() {
    this.authService
      .getProfile()
      .pipe(
        take(2),
        catchError(() => of(null)),
      )
      .subscribe((profile) => {
        if (!profile) {
          return;
        }
        this.userId.set(profile?._id ?? '');
        this.userName.set(profile?.name || 'User');
      });
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  openDeleteConfirmation() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        mainMsg: $localize`Permanently Delete All Your Data`,
        subMsg: $localize`This action cannot be undone. All your data including your account, favorites, saved dishes, interactions, and collections will be permanently deleted. Are you absolutely sure you want to proceed?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteUserData();
      }
    });
  }

  private deleteUserData() {
    const userId = this.userId();
    if (!userId) {
      this.toastService.showError($localize`User ID not found`);
      return;
    }

    this.isDeleting.set(true);
    this.userService.deleteUserData(userId).subscribe({
      next: () => {
        this.toastService.showSuccess(
          $localize`All your data has been permanently deleted`,
        );

        // Get refresh token and logout
        const refreshToken = cookies.get(Cookies_Key.REFRESH_TOKEN);
        if (refreshToken) {
          this.authService.logout(refreshToken).subscribe({
            next: () => {
              // Clear authentication tokens
              cookies.remove(Cookies_Key.TOKEN);
              cookies.remove(Cookies_Key.REFRESH_TOKEN);
              this.router.navigate(['/']);
            },
            error: () => {
              // Even if logout fails, clear cookies and navigate
              cookies.remove(Cookies_Key.TOKEN);
              cookies.remove(Cookies_Key.REFRESH_TOKEN);
              this.router.navigate(['/']);
            },
          });
        } else {
          // No refresh token, just clear and navigate
          cookies.remove(Cookies_Key.TOKEN);
          cookies.remove(Cookies_Key.REFRESH_TOKEN);
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error deleting user data:', error);
        this.toastService.showError(
          $localize`Failed to delete data. Please try again.`,
        );
        this.isDeleting.set(false);
      },
    });
  }
}
