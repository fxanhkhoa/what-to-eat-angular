import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DishSectionComponent } from './dish-section/dish-section.component';
import { GameSectionComponent } from './game-section/game-section.component';
import { IngredientSectionComponent } from './ingredient-section/ingredient-section.component';
import { QuoteSectionComponent } from './quote-section/quote-section.component';
import { ContactSectionComponent } from './contact-section/contact-section.component';

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
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  localeId = inject(LOCALE_ID);

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
    // @ts-ignore
    const locale = this.localeId;
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
        content:
          'https://eatwhat.io.vn/assets/logo/what-to-eat-high-resolution-logo-black-transparent.webp',
      });
      this.metaService.updateTag({
        property: 'og:url',
        content: 'https://eatwhat.io.vn/',
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
        content:
          'https://eatwhat.io.vn/assets/logo/what-to-eat-high-resolution-logo-black-transparent.webp',
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
        content:
          'https://eatwhat.io.vn/assets/logo/what-to-eat-high-resolution-logo-black-transparent.webp',
      });
      this.metaService.updateTag({
        property: 'og:url',
        content: 'https://eatwhat.io.vn/',
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
        content:
          'https://eatwhat.io.vn/assets/logo/what-to-eat-high-resolution-logo-black-transparent.webp',
      });
    }
  }
}
