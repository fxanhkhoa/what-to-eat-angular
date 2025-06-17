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
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DomSanitizer } from '@angular/platform-browser';
import { MatListModule } from '@angular/material/list';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-client',
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ScrollingModule,
    MatListModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit {
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);
  private ngZone = inject(NgZone);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private fb: FormBuilder = inject(FormBuilder);

  _boundScrollHandler?: () => void;
  isScrolled = false;
  isMenuOpen = false;
  currentYear: number = new Date().getFullYear();
  newsletterForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.iconRegistry.addSvgIcon(
      'tiktok',
      this.sanitizer.bypassSecurityTrustResourceUrl('/icons/tiktok.svg')
    );
  }

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

  subscribeToNewsletter(): void {
    if (this.newsletterForm.valid) {
      const email = this.newsletterForm.get('email')?.value;
      console.log('Subscribing email:', email);

      // TODO: Add your newsletter subscription service call here
      // this.newsletterService.subscribe(email).subscribe(
      //   response => {
      //     console.log('Subscription successful', response);
      //     this.newsletterForm.reset();
      //   },
      //   error => console.error('Subscription failed', error)
      // );
    }
  }
}
