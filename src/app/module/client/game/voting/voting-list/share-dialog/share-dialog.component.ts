import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EncodeURIComponentPipe } from '@/app/pipe/encode-uri.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    MatTooltipModule,
    EncodeURIComponentPipe,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
})
export class ShareDialogComponent {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  public data: { url: string } = inject(MAT_DIALOG_DATA);
  private dialogRef: MatDialogRef<ShareDialogComponent> = inject(MatDialogRef);
  private clipboard: Clipboard = inject(Clipboard);

  copied = false;
  shareUrl: string;

  constructor() {
    this.shareUrl = this.data.url;

    this.iconRegistry.addSvgIcon(
      'facebook',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/facebook.svg'
      )
    );

    this.iconRegistry.addSvgIcon(
      'telegram',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/telegram.svg'
      )
    );

    this.iconRegistry.addSvgIcon(
      'x-social',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/x-social.svg'
      )
    );
  }

  copyLink() {
    this.clipboard.copy(this.shareUrl);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  openInNewTab() {
    window.open(this.shareUrl, '_blank');
  }

  close() {
    this.dialogRef.close();
  }
}
