import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SafeUrl } from '@angular/platform-browser';
import { ConfirmDialogComponent } from '../component/confirm-dialog/confirm-dialog.component';
import { ErrorSnackbarComponent } from '../component/error-snackbar/error-snackbar.component';
import { NotificationSnackbarComponent } from '../component/notification-snackbar/notification-snackbar.component';
import { SuccessSnackbarComponent } from '../component/success-snackbar/success-snackbar.component';
import { ImageViewerComponent } from '../widget/image-viewer/image-viewer.component';
import { WarningSnackbarComponent } from '../component/warning-snackbar/warning-snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {}

  showSuccess(
    mainMsg: string = 'Success',
    subMsg: string = 'operation completed successfully',
    duration: number = 1500,
  ) {
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      duration,
      data: {
        mainMsg,
        subMsg,
      },
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  showError(mainMsg: string, subMsg: string = 'An error occurred', duration: number = 1500) {
    this.snackBar.openFromComponent(ErrorSnackbarComponent, {
      duration,
      data: {
        mainMsg,
        subMsg,
      },
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  showWarning(mainMsg: string, subMsg: string, duration: number = 1500) {
    this.snackBar.openFromComponent(WarningSnackbarComponent, {
      duration,
      data: {
        mainMsg,
        subMsg,
      },
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  showCopied() {
    this.snackBar.open($localize`copied-to-clipboard`, 'OK', {
      duration: 1000,
    });
  }

  showConfirm(
    mainMsg?: string,
    subMsg?: string,
  ): MatDialogRef<ConfirmDialogComponent, boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        mainMsg,
        subMsg,
      },
      autoFocus: false,
    });

    return dialogRef;
  }

  showImage(
    imageUrl: string | SafeUrl | undefined,
  ): MatDialogRef<ImageViewerComponent, any> | null {
    if (typeof imageUrl === undefined) {
      return null;
    }
    const dialogRef = this.dialog.open(ImageViewerComponent, {
      data: imageUrl,
      width: '100%',
      autoFocus: false,
    });

    return dialogRef;
  }

  showNotification(
    mainMsg: string,
    subMsg: string,
    duration: number,
    redirectUrl: string,
  ) {
    this.snackBar.openFromComponent(NotificationSnackbarComponent, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration,
      data: {
        mainMsg,
        subMsg,
        redirectUrl,
      },
    });
  }

  sendErrorSocketIO() {
    this.showError($localize`error`, $localize`socket-not-connected`, 1500);
  }
}
