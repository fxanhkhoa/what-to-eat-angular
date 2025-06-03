import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  Renderer2,
  DOCUMENT,
  NgZone,
  PLATFORM_ID,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-client',
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ScrollingModule,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit {
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);
  private ngZone = inject(NgZone);
  _boundScrollHandler?: () => void;
  isScrolled = false;
  isMenuOpen = false;

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'dark-theme');
    this.renderer.addClass(this.document.body, 'client-body');
  }

  // Add this method to your ClientComponent class
  onScroll(event: Event): void {
    const scrollPosition =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // Run inside NgZone to trigger change detection
    this.ngZone.run(() => {
      this.isScrolled = scrollPosition > 50;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
