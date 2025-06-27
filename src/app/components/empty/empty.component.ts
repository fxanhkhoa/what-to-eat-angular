import { Component, inject } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-empty',
  imports: [MatIconModule],
  templateUrl: './empty.component.html',
  styleUrl: './empty.component.scss',
})
export class EmptyComponent {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  constructor() {
    this.iconRegistry.addSvgIcon(
      'empty',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/empty.svg')
    );
  }
}
