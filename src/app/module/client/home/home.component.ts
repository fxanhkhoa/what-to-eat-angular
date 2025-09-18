import {
  Component,
  inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title, Meta } from '@angular/platform-browser';
import { ContactSectionComponent } from './contact-section/contact-section.component';
import { DishSectionComponent } from './dish-section/dish-section.component';
import { GameSectionComponent } from './game-section/game-section.component';
import { IngredientSectionComponent } from './ingredient-section/ingredient-section.component';
import { QuoteSectionComponent } from './quote-section/quote-section.component';
import { environment } from '@/environments/environment';
@Component({
  selector: 'app-home',
  imports: [
    MatButtonModule,
    MatIconModule,
    DishSectionComponent,
    GameSectionComponent,
    IngredientSectionComponent,
    QuoteSectionComponent,
    ContactSectionComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  localeId = inject(LOCALE_ID);
  platformId = inject(PLATFORM_ID);

  constructor() {
    this.iconRegistry.addSvgIcon(
      'facebook',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/facebook.svg'
      )
    );

    this.iconRegistry.addSvgIcon(
      'tiktok',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/tiktok.svg')
    );
  }

  ngOnInit(): void {
    const locale = this.localeId;
    this.addOrUpdateCanonicalLink();
    this.addHrefLangLinks();
    if (locale.startsWith('vi')) {
      this.titleService.setTitle(
        'Ăn gì hôm nay - Khám phá bữa ăn tiếp theo của bạn'
      );
      this.metaService.updateTag({
        name: 'description',
        content:
          'Khám phá thế giới ẩm thực và tìm món ăn tiếp theo của bạn với Ăn gì hôm nay. Khám phá món ăn, nguyên liệu và nhiều hơn nữa cho hành trình ẩm thực của bạn.',
      });
      this.metaService.updateTag({
        name: 'keywords',
        content:
          'ẩm thực, món ăn, công thức, nguyên liệu, bữa ăn, khám phá, ăn gì, nhà hàng, nấu ăn, ẩm thực Việt Nam',
      });
      this.metaService.updateTag({
        property: 'og:title',
        content: 'Ăn gì hôm nay - Khám phá bữa ăn tiếp theo của bạn',
      });
      this.metaService.updateTag({
        property: 'og:description',
        content:
          'Khám phá thế giới ẩm thực và tìm món ăn tiếp theo của bạn với Ăn gì hôm nay.',
      });
      this.metaService.updateTag({
        property: 'og:image',
        content: 'https://an-gi.io.vn/assets/images/og-image.png',
      });
      this.metaService.updateTag({
        property: 'og:url',
        content: 'https://an-gi.io.vn/',
      });
      this.metaService.updateTag({
        name: 'twitter:card',
        content: 'summary_large_image',
      });
      this.metaService.updateTag({
        name: 'twitter:title',
        content: 'Ăn gì hôm nay - Khám phá bữa ăn tiếp theo của bạn',
      });
      this.metaService.updateTag({
        name: 'twitter:description',
        content:
          'Khám phá thế giới ẩm thực và tìm món ăn tiếp theo của bạn với Ăn gì hôm nay.',
      });
      this.metaService.updateTag({
        name: 'twitter:image',
        content: 'https://an-gi.io.vn/assets/images/og-image.png',
      });
    } else {
      this.titleService.setTitle('What To Eat - Discover Your Next Meal');
      this.metaService.updateTag({
        name: 'description',
        content:
          'Unlock a world of dining options and find your next meal with What To Eat. Discover dishes, ingredients, and more for your next culinary adventure.',
      });
      this.metaService.updateTag({
        name: 'keywords',
        content:
          'food, dining, recipes, ingredients, meals, discover, what to eat, restaurant, cooking, cuisine',
      });
      this.metaService.updateTag({
        property: 'og:title',
        content: 'What To Eat - Discover Your Next Meal',
      });
      this.metaService.updateTag({
        property: 'og:description',
        content:
          'Unlock a world of dining options and find your next meal with What To Eat.',
      });
      this.metaService.updateTag({
        property: 'og:image',
        content: 'https://an-gi.io.vn/assets/images/og-image.png',
      });
      this.metaService.updateTag({
        property: 'og:url',
        content: 'https://an-gi.io.vn/',
      });
      this.metaService.updateTag({
        name: 'twitter:card',
        content: 'summary_large_image',
      });
      this.metaService.updateTag({
        name: 'twitter:title',
        content: 'What To Eat - Discover Your Next Meal',
      });
      this.metaService.updateTag({
        name: 'twitter:description',
        content:
          'Unlock a world of dining options and find your next meal with What To Eat.',
      });
      this.metaService.updateTag({
        name: 'twitter:image',
        content: 'https://an-gi.io.vn/assets/images/og-image.png',
      });
    }
  }

  private addOrUpdateCanonicalLink() {
    // Remove existing canonical link if it exists
    const existingCanonical = this.document.querySelector(
      'link[rel="canonical"]'
    );
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link with proper URL based on locale and dish slug
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');

    // Get dish slug from current route
    const baseUrl = environment.BASE_URL;
    let canonicalUrl = baseUrl;

    if (this.localeId.startsWith('vi')) {
      canonicalUrl = `${baseUrl}/vi`;
    } else {
      canonicalUrl = `${baseUrl}/en`;
    }

    link.setAttribute('href', canonicalUrl);
    this.document.head.appendChild(link);
  }

  private addHrefLangLinks() {
    // Remove existing hreflang links if they exist
    const existingHrefLangs = this.document.querySelectorAll(
      'link[rel="alternate"][hreflang]'
    );
    existingHrefLangs.forEach((link) => link.remove());

    const baseUrl = environment.BASE_URL;

    // Add Vietnamese version
    const viLink = this.document.createElement('link');
    viLink.setAttribute('rel', 'alternate');
    viLink.setAttribute('hreflang', 'vi');
    viLink.setAttribute('href', `${baseUrl}/vi`);
    this.document.head.appendChild(viLink);

    // Add English version
    const enLink = this.document.createElement('link');
    enLink.setAttribute('rel', 'alternate');
    enLink.setAttribute('hreflang', 'en');
    enLink.setAttribute('href', `${baseUrl}/en`);
    this.document.head.appendChild(enLink);

    // Add x-default for default language
    const defaultLink = this.document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${baseUrl}/en`);
    this.document.head.appendChild(defaultLink);
  }

  ngOnDestroy() {
    // Clean up structured data when component is destroyed
    const existingScript = this.document.getElementById('dish-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Clean up canonical link
    const existingCanonical = this.document.querySelector(
      'link[rel="canonical"]'
    );
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Clean up hreflang links
    const existingHrefLangs = this.document.querySelectorAll(
      'link[rel="alternate"][hreflang]'
    );
    existingHrefLangs.forEach((link) => link.remove());
  }
}
