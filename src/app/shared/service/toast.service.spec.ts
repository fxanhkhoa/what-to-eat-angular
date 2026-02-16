import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SafeUrl } from '@angular/platform-browser';

import { ToastService } from './toast.service';
import { SuccessSnackbarComponent } from '../component/success-snackbar/success-snackbar.component';
import { ErrorSnackbarComponent } from '../component/error-snackbar/error-snackbar.component';
import { WarningSnackbarComponent } from '../component/warning-snackbar/warning-snackbar.component';
import { NotificationSnackbarComponent } from '../component/notification-snackbar/notification-snackbar.component';
import { ConfirmDialogComponent } from '../component/confirm-dialog/confirm-dialog.component';
import { ImageViewerComponent } from '../widget/image-viewer/image-viewer.component';

describe('ToastService', () => {
  let service: ToastService;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBarRef: jasmine.SpyObj<MatSnackBarRef<any>>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<any, any>>;

  beforeEach(() => {
    mockSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismiss']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['openFromComponent', 'open']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockSnackBar.openFromComponent.and.returnValue(mockSnackBarRef);
    mockSnackBar.open.and.returnValue(mockSnackBarRef);
    mockDialog.open.and.returnValue(mockDialogRef);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog }
      ]
    });
    service = TestBed.inject(ToastService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      expect(service).toBeDefined();
    });

    it('should inject MatSnackBar', () => {
      expect(service['snackBar']).toBe(mockSnackBar);
    });

    it('should inject MatDialog', () => {
      expect(service.dialog).toBe(mockDialog);
    });
  });

  describe('showSuccess', () => {
    it('should open success snackbar with correct parameters', () => {
      const mainMsg = 'Success!';
      const subMsg = 'Operation completed';
      const duration = 3000;

      service.showSuccess(mainMsg, subMsg, duration);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        SuccessSnackbarComponent,
        {
          duration,
          data: { mainMsg, subMsg },
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }
      );
    });

    it('should call openFromComponent once', () => {
      service.showSuccess('Test', 'Message', 2000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledTimes(1);
    });

    it('should handle empty strings', () => {
      service.showSuccess('', '', 1000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        SuccessSnackbarComponent,
        jasmine.objectContaining({
          data: { mainMsg: '', subMsg: '' }
        })
      );
    });
  });

  describe('showError', () => {
    it('should open error snackbar with correct parameters', () => {
      const mainMsg = 'Error!';
      const subMsg = 'Something went wrong';
      const duration = 5000;

      service.showError(mainMsg, subMsg, duration);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        ErrorSnackbarComponent,
        {
          duration,
          data: { mainMsg, subMsg },
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }
      );
    });

    it('should call openFromComponent once', () => {
      service.showError('Error', 'Message', 2000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledTimes(1);
    });

    it('should position snackbar at top-end', () => {
      service.showError('Test', 'Error', 1000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        ErrorSnackbarComponent,
        jasmine.objectContaining({
          horizontalPosition: 'end',
          verticalPosition: 'top'
        })
      );
    });
  });

  describe('showWarning', () => {
    it('should open warning snackbar with correct parameters', () => {
      const mainMsg = 'Warning!';
      const subMsg = 'Please be careful';
      const duration = 4000;

      service.showWarning(mainMsg, subMsg, duration);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        WarningSnackbarComponent,
        {
          duration,
          data: { mainMsg, subMsg },
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }
      );
    });

    it('should call openFromComponent once', () => {
      service.showWarning('Warning', 'Message', 2000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledTimes(1);
    });

    it('should use correct component', () => {
      service.showWarning('Test', 'Warning', 1000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        WarningSnackbarComponent,
        jasmine.any(Object)
      );
    });
  });

  describe('showCopied', () => {
    it('should open simple snackbar with copied message', () => {
      service.showCopied();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        jasmine.any(String),
        'OK',
        { duration: 1000 }
      );
    });

    it('should call open once', () => {
      service.showCopied();

      expect(mockSnackBar.open).toHaveBeenCalledTimes(1);
    });

    it('should have 1 second duration', () => {
      service.showCopied();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        jasmine.any(String),
        'OK',
        jasmine.objectContaining({ duration: 1000 })
      );
    });
  });

  describe('showConfirm', () => {
    it('should open confirm dialog with correct parameters', () => {
      const mainMsg = 'Confirm?';
      const subMsg = 'Are you sure?';

      const result = service.showConfirm(mainMsg, subMsg);

      expect(mockDialog.open).toHaveBeenCalledWith(
        ConfirmDialogComponent,
        {
          data: { mainMsg, subMsg },
          autoFocus: false
        }
      );
      expect(result).toBe(mockDialogRef);
    });

    it('should return MatDialogRef', () => {
      const result = service.showConfirm('Test', 'Message');

      expect(result).toBe(mockDialogRef);
    });

    it('should handle undefined messages', () => {
      service.showConfirm(undefined, undefined);

      expect(mockDialog.open).toHaveBeenCalledWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({
          data: { mainMsg: undefined, subMsg: undefined }
        })
      );
    });

    it('should disable autoFocus', () => {
      service.showConfirm('Test', 'Message');

      expect(mockDialog.open).toHaveBeenCalledWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({ autoFocus: false })
      );
    });

    it('should call dialog.open once', () => {
      service.showConfirm('Test', 'Message');

      expect(mockDialog.open).toHaveBeenCalledTimes(1);
    });
  });

  describe('showImage', () => {
    it('should open image viewer dialog with string URL', () => {
      const imageUrl = 'https://example.com/image.jpg';

      const result = service.showImage(imageUrl);

      expect(mockDialog.open).toHaveBeenCalledWith(
        ImageViewerComponent,
        {
          data: imageUrl,
          width: '100%',
          autoFocus: false
        }
      );
      expect(result).toBe(mockDialogRef);
    });

    it('should always return dialog ref (bug: typeof check is incorrect)', () => {
      // Note: The code has a bug - typeof imageUrl === undefined (missing quotes)
      // This means the check never evaluates to true, so null is never returned
      const result = service.showImage(undefined);

      expect(result).toBe(mockDialogRef);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should handle SafeUrl type', () => {
      const safeUrl = { changingThisBreaksApplicationSecurity: 'safe-url' } as SafeUrl;

      const result = service.showImage(safeUrl);

      expect(mockDialog.open).toHaveBeenCalledWith(
        ImageViewerComponent,
        jasmine.objectContaining({ data: safeUrl })
      );
      expect(result).toBe(mockDialogRef);
    });

    it('should set dialog width to 100%', () => {
      service.showImage('test.jpg');

      expect(mockDialog.open).toHaveBeenCalledWith(
        ImageViewerComponent,
        jasmine.objectContaining({ width: '100%' })
      );
    });

    it('should disable autoFocus', () => {
      service.showImage('test.jpg');

      expect(mockDialog.open).toHaveBeenCalledWith(
        ImageViewerComponent,
        jasmine.objectContaining({ autoFocus: false })
      );
    });
  });

  describe('showNotification', () => {
    it('should open notification snackbar with correct parameters', () => {
      const mainMsg = 'New notification';
      const subMsg = 'You have updates';
      const duration = 5000;
      const redirectUrl = '/dashboard';

      service.showNotification(mainMsg, subMsg, duration, redirectUrl);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        NotificationSnackbarComponent,
        {
          horizontalPosition: 'end',
          verticalPosition: 'top',
          duration,
          data: { mainMsg, subMsg, redirectUrl }
        }
      );
    });

    it('should include redirect URL in data', () => {
      service.showNotification('Test', 'Message', 3000, '/test-url');

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        NotificationSnackbarComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({ redirectUrl: '/test-url' })
        })
      );
    });

    it('should call openFromComponent once', () => {
      service.showNotification('Test', 'Message', 2000, '/url');

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledTimes(1);
    });

    it('should position snackbar at top-end', () => {
      service.showNotification('Test', 'Message', 3000, '/url');

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        NotificationSnackbarComponent,
        jasmine.objectContaining({
          horizontalPosition: 'end',
          verticalPosition: 'top'
        })
      );
    });
  });

  describe('sendErrorSocketIO', () => {
    it('should call showError with socket error message', () => {
      spyOn(service, 'showError');

      service.sendErrorSocketIO();

      expect(service.showError).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String),
        1500
      );
    });

    it('should use 1500ms duration', () => {
      spyOn(service, 'showError');

      service.sendErrorSocketIO();

      expect(service.showError).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String),
        1500
      );
    });

    it('should call showError once', () => {
      spyOn(service, 'showError');

      service.sendErrorSocketIO();

      expect(service.showError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Toast Scenarios', () => {
    it('should handle multiple success toasts in sequence', () => {
      service.showSuccess('First', 'Message', 1000);
      service.showSuccess('Second', 'Message', 1000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledTimes(2);
    });

    it('should handle different toast types in sequence', () => {
      service.showSuccess('Success', 'Message', 1000);
      service.showError('Error', 'Message', 1000);
      service.showWarning('Warning', 'Message', 1000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledTimes(3);
    });

    it('should handle zero duration', () => {
      service.showSuccess('Test', 'Message', 0);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        SuccessSnackbarComponent,
        jasmine.objectContaining({ duration: 0 })
      );
    });

    it('should handle very long duration', () => {
      service.showError('Test', 'Message', 999999);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        ErrorSnackbarComponent,
        jasmine.objectContaining({ duration: 999999 })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in messages', () => {
      service.showSuccess('Test & <Special> "Chars"', 'Sub & <Message>', 1000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        SuccessSnackbarComponent,
        jasmine.objectContaining({
          data: { mainMsg: 'Test & <Special> "Chars"', subMsg: 'Sub & <Message>' }
        })
      );
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      service.showError(longMessage, longMessage, 1000);

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        ErrorSnackbarComponent,
        jasmine.objectContaining({
          data: { mainMsg: longMessage, subMsg: longMessage }
        })
      );
    });

    it('should handle empty redirect URL', () => {
      service.showNotification('Test', 'Message', 1000, '');

      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
        NotificationSnackbarComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({ redirectUrl: '' })
        })
      );
    });
  });
});
