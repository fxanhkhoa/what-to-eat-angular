import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { DishService } from '@/app/service/dish.service';
import { MEAL_CATEGORIES } from '@/enum/dish.enum';
import { Dish } from '@/types/dish.type';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, LOCALE_ID, OnInit, signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DishCardFancyComponent } from './dish-card-fancy/dish-card-fancy.component';
import { EmptyComponent } from '@/app/components/empty/empty.component';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-dish',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CategoryTranslatePipe,
    DishCardFancyComponent,
    EmptyComponent,
  ],
  templateUrl: './dish.component.html',
  styleUrl: './dish.component.scss',
})
export class DishComponent implements OnInit {
  localeId = inject<string>(LOCALE_ID);
  private dishService = inject(DishService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  Math = Math;

  listMealCategories: string[] = [];
  listDishCategory_1 = signal<Dish[]>([]);
  listDishCategory_2 = signal<Dish[]>([]);
  listDishCategory_3 = signal<Dish[]>([]);
  listDishCategory_4 = signal<Dish[]>([]);

  ngOnInit(): void {
    // SEO meta tags with i18n
    const seo = {
      vi: {
        title: 'Món ăn | What To Eat',
        description:
          'Khám phá danh sách các món ăn hấp dẫn, đa dạng và phù hợp với khẩu vị của bạn tại What To Eat.',
        keywords:
          'món ăn, thực đơn, ẩm thực, what to eat, món ngon, gợi ý món ăn, công thức nấu ăn',
      },
      en: {
        title: 'Dishes | What To Eat',
        description:
          'Discover a variety of delicious dishes and recipes tailored to your taste at What To Eat.',
        keywords:
          'dishes, menu, cuisine, what to eat, delicious food, food suggestion, recipe',
      },
    };
    const lang = this.localeId === 'vi' ? 'vi' : 'en';
    this.titleService.setTitle(seo[lang].title);
    this.metaService.updateTag({
      name: 'description',
      content: seo[lang].description,
    });
    this.metaService.updateTag({
      name: 'keywords',
      content: seo[lang].keywords,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: seo[lang].title,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: seo[lang].description,
    });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({
      name: 'twitter:title',
      content: seo[lang].title,
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: seo[lang].description,
    });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    // Add canonical URL
    this.addOrUpdateCanonicalLink();
    this.addHrefLangLinks();

    this.listMealCategories = this.getRandomMealCategories(4);
    this.getDishes_1();
    this.getDishes_2();
    this.getDishes_3();
    this.getDishes_4();
  }

  getDishes_1() {
    this.dishService
      .findAll({
        page: 1,
        limit: 10,
        mealCategories: [this.listMealCategories[0]],
      })
      .subscribe((res) => {
        if (res.data) {
          this.listDishCategory_1.set(res.data);
        }
      });
  }

  getDishes_2() {
    this.dishService
      .findAll({
        page: 1,
        limit: 1,
        mealCategories: [this.listMealCategories[1]],
      })
      .subscribe((res) => {
        if (res.data) {
          this.listDishCategory_2.set(res.data);
        }
      });
  }

  getDishes_3() {
    this.dishService
      .findAll({
        page: 1,
        limit: 4,
        mealCategories: [this.listMealCategories[2]],
      })
      .subscribe((res) => {
        if (res.data) {
          this.listDishCategory_3.set(res.data);
        }
      });
  }

  getDishes_4() {
    this.dishService
      .findAll({
        page: 1,
        limit: 3,
        mealCategories: [this.listMealCategories[3]],
      })
      .subscribe((res) => {
        if (res.data) {
          this.listDishCategory_4.set(res.data);
        }
      });
  }

  getRandomMealCategories(count: number): string[] {
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

    return randomCategories;
  }

  goBack() {
    window.history.back();
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
      canonicalUrl = `${baseUrl}/vi/dish`;
    } else {
      canonicalUrl = `${baseUrl}/en/dish`;
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
    viLink.setAttribute('href', `${baseUrl}/vi/dish`);
    this.document.head.appendChild(viLink);

    // Add English version
    const enLink = this.document.createElement('link');
    enLink.setAttribute('rel', 'alternate');
    enLink.setAttribute('hreflang', 'en');
    enLink.setAttribute('href', `${baseUrl}/en/dish`);
    this.document.head.appendChild(enLink);

    // Add x-default for default language
    const defaultLink = this.document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${baseUrl}/en/dish`);
    this.document.head.appendChild(defaultLink);
  }
}
