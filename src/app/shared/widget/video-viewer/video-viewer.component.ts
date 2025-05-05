import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-video-viewer',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './video-viewer.component.html',
  styleUrl: './video-viewer.component.scss',
})
export class VideoViewerComponent {
  readonly dialogRef = inject(MatDialogRef<ImageViewerComponent>);
  readonly data = inject<string>(MAT_DIALOG_DATA);
}
