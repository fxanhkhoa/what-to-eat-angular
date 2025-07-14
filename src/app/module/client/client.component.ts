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
  LOCALE_ID,
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
import { MEAL_CATEGORIES } from '@/enum/dish.enum';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MatMenuModule } from '@angular/material/menu';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { JWTTokenPayload } from '@/types/auth.type';
import { jwtDecode } from 'jwt-decode';

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
    CategoryTranslatePipe,
    MatMenuModule,
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
  localeId = inject<string>(LOCALE_ID);

  mealCategories: string[] = [];
  currentLanguage = this.localeId;
  availableLanguages = [
    {
      code: 'en',
      name: 'English',
      image: '/assets/images/Flag_of_the_United_States.svg.webp',
    },
    {
      code: 'vi',
      name: 'Vietnamese',
      image: '/assets/images/Flag_of_Vietnam.svg.webp',
    },
  ];

  _boundScrollHandler?: () => void;
  isScrolled = false;
  isMenuOpen = false;
  currentYear: number = new Date().getFullYear();
  newsletterForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  payload?: JWTTokenPayload;

  constructor() {
    this.iconRegistry.addSvgIcon(
      'tiktok',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/tiktok.svg')
    );
  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'dark-theme');
    this.renderer.addClass(this.document.body, 'client-body');
    this.getRandomMealCategories(4);

    const token = cookies.get(Cookies_Key.TOKEN);

    if (token) {
      this.payload = jwtDecode<JWTTokenPayload>(token ?? '');
    }
  }

  avatarFromPlaceholder() {
    if (this.payload) {
      return `https://ui-avatars.com/api/?name=${this.payload.name}&background=random&color=fff&size=128`;
    }
    return 'https://ui-avatars.com/api/?name=Guest&background=random&color=fff&size=128';
  }

  changeLanguage(langCode: string) {
    if (this.currentLanguage !== langCode) {
      this.currentLanguage = langCode;

      // Store the selected language in localStorage for persistence
      localStorage.setItem('preferredLanguage', langCode);

      // Construct the new URL with the language parameter
      // This assumes your app is configured to handle locale in the URL
      // e.g., from /en/home to /vi/home
      const baseUrl = window.location.origin;
      const pathWithoutLocale = window.location.pathname.replace(
        /^\/[a-zA-Z]{2}\//,
        '/'
      );
      const newUrl = `${baseUrl}/${langCode}${pathWithoutLocale}${window.location.search}`;

      // Redirect to the new URL with the selected language
      window.location.href = newUrl;
    }
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

  getRandomMealCategories(count: number): void {
    // Make a copy of the array to avoid modifying the original
    const availableCategories = [...Object.values(MEAL_CATEGORIES)];
    const randomCategories: string[] = [];

    // Get the minimum of requested count or available categories length
    const selectCount = Math.min(count, availableCategories.length);

    // Select random categories
    for (let i = 0; i < selectCount; i++) {
      // Get a random index
      const randomIndex = Math.floor(
        Math.random() * availableCategories.length
      );
      // Add the category at that index to our result
      randomCategories.push(availableCategories[randomIndex]);
      // Remove that category from available options to avoid duplicates
      availableCategories.splice(randomIndex, 1);
    }

    this.mealCategories = randomCategories;
  }
}
