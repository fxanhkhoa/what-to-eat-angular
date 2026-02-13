import {
  Component,
  inject,
  signal,
  computed,
  effect,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location, DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Dish } from '@/types/dish.type';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryBadgesComponent } from '@/app/shared/component/category-badges/category-badges.component';
import { YouTubePlayer } from '@angular/youtube-player';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { IngredientService } from '@/app/service/ingredient.service';
import { DishService } from '@/app/service/dish.service';
import { UserDishInteractionService } from '@/app/service/user-dish-interaction.service';
import { Ingredient } from '@/types/ingredient.type';
import { finalize, forkJoin, mergeMap, of } from 'rxjs';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { DishCardFancyComponent } from '../dish-card-fancy/dish-card-fancy.component';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-dish-detail',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MultiLanguagePipe,
    CategoryTranslatePipe,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CategoryBadgesComponent,
    YouTubePlayer,
    MatCheckboxModule,
    EmptyComponent,
    DishCardFancyComponent,
  ],
  templateUrl: './dish-detail.component.html',
  styleUrls: ['./dish-detail.component.scss'],
  standalone: true,
})
export class DishDetailComponent implements OnDestroy, OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private iconRegistry = inject(MatIconRegistry);
  private ingredientService = inject(IngredientService);
  private dishService = inject(DishService);
  private userDishInteractionService = inject(UserDishInteractionService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  localeId = inject(LOCALE_ID);
  private platformId = inject(PLATFORM_ID);

  dish = signal<Dish | null>(null);
  ingredients = signal<Ingredient[]>([]);
  relatedDishes = signal<Dish[]>([]);
  pageUrl = signal('');
  loading = signal<boolean>(false);

  constructor() {
    this.iconRegistry.addSvgIcon(
      'easy',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/easy.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'medium',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/medium.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'hard',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/hard.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'cooking_time',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/cooking_time.svg',
      ),
    );
    this.iconRegistry.addSvgIcon(
      'preparation_time',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/preparation_time.svg',
      ),
    );
    this.iconRegistry.addSvgIcon(
      'facebook',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/facebook.svg',
      ),
    );
    this.iconRegistry.addSvgIcon(
      'tiktok',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/tiktok.svg'),
    );
  }

  ngOnInit() {
    // Set default SEO meta tags
    this.setDefaultSEO();

    const data = this.route.snapshot.data;
    this.pageUrl.set(data['pageUrl']);
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.getData(slug);
      }
    });
  }

  dishThumbUrl = computed(() => {
    const dish = this.dish();
    if (!dish || !dish.thumbnail) return '';
    return `url("${dish.thumbnail}")`;
  });

  getData(slug: string) {
    if (!slug) return;

    this.loading.set(true);

    this.dishService
      .findBySlug(slug)
      .pipe(
        finalize(() => this.loading.set(false)),
        mergeMap((dish) => {
          if (!dish) return of(null);

          const dishObservables =
            dish.relatedDishes?.map((relatedDish) =>
              this.dishService.findOne(relatedDish),
            ) ?? [];
          const ingredientObservables =
            dish.ingredients?.map((ingredient) =>
              this.ingredientService.findOne(ingredient.ingredientId),
            ) ?? [];

          return forkJoin([...dishObservables, ...ingredientObservables]).pipe(
            // Pass lengths along for later use
            mergeMap((results) => {
              const relatedDishesLength = dishObservables.length;

              const relatedDishes = results.slice(0, relatedDishesLength);
              const ingredients = results.slice(
                relatedDishesLength,
              ) as Ingredient[];

              this.relatedDishes.set(relatedDishes as Dish[]);
              this.ingredients.set(ingredients as Ingredient[]);
              return of(dish);
            }),
          );
        }),
      )
      .subscribe((dish) => {
        if (dish) {
          this.dish.set(dish);
          this.updateSEOWithDishData(dish);
          this.addStructuredData(dish);
          this.addOrUpdateCanonicalLink();

          // Record view interaction
          this.userDishInteractionService
            .recordView({
              userId: '', // Will be set by backend from token
              dishId: dish._id,
              dishSlug: dish.slug,
            })
            .subscribe({
              next: () => {
                console.log('View recorded');
              },
              error: (err) => {
                console.error('Failed to record view', err);
              },
            });
          this.addHrefLangLinks();
        }
      });
  }

  private setDefaultSEO() {
    this.titleService.setTitle('Chi tiết món ăn | What To Eat');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Xem chi tiết món ăn, thành phần, cách chế biến và đánh giá tại What To Eat.',
    });
    this.metaService.updateTag({
      name: 'keywords',
      content:
        'chi tiết món ăn, công thức nấu ăn, thành phần, what to eat, món ngon',
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: 'Chi tiết món ăn | What To Eat',
    });
    this.metaService.updateTag({
      property: 'og:description',
      content:
        'Xem chi tiết món ăn, thành phần, cách chế biến và đánh giá tại What To Eat.',
    });
    this.metaService.updateTag({
      property: 'og:type',
      content: 'article',
    });
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({
      name: 'twitter:title',
      content: 'Chi tiết món ăn | What To Eat',
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content:
        'Xem chi tiết món ăn, thành phần, cách chế biến và đánh giá tại What To Eat.',
    });
    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow',
    });
  }

  private updateSEOWithDishData(dish: Dish) {
    const dishName = this.getDishName(dish);
    const dishDescription = this.getDishDescription(dish);

    if (dishName) {
      const title = `${dishName} | What To Eat`;
      this.titleService.setTitle(title);
      this.metaService.updateTag({ property: 'og:title', content: title });
    }

    if (dishDescription) {
      this.metaService.updateTag({
        name: 'description',
        content: dishDescription,
      });
      this.metaService.updateTag({
        property: 'og:description',
        content: dishDescription,
      });
    }

    if (dish.thumbnail) {
      this.metaService.updateTag({
        property: 'og:image',
        content: dish.thumbnail,
      });
      this.metaService.updateTag({
        name: 'twitter:image',
        content: dish.thumbnail,
      });
    }

    // Update Twitter card title and description
    if (dishName) {
      this.metaService.updateTag({
        name: 'twitter:title',
        content: `${dishName} | What To Eat`,
      });
    }

    if (dishDescription) {
      this.metaService.updateTag({
        name: 'twitter:description',
        content: dishDescription,
      });
    }

    // Add structured data keywords from categories
    const categories = [
      ...(dish.mealCategories || []),
      ...(dish.ingredientCategories || []),
    ];
    if (categories.length > 0) {
      const keywords = `${dishName}, ${categories.join(
        ', ',
      )}, công thức nấu ăn, what to eat, món ngon`;
      this.metaService.updateTag({ name: 'keywords', content: keywords });
    }
  }

  private getDishName(dish: Dish): string {
    if (!dish.title) return '';
    const nameObj = dish.title.find((n: any) => n.lang === this.localeId);
    return nameObj?.data || dish.title[0]?.data || '';
  }

  private getDishDescription(dish: Dish): string {
    if (!dish.shortDescription) return '';
    const descObj = dish.shortDescription.find(
      (d: any) => d.lang === this.localeId,
    );
    const description = descObj?.data || dish.shortDescription[0]?.data || '';
    // Limit description length for meta tags
    return description.length > 160
      ? description.substring(0, 157) + '...'
      : description;
  }

  private addStructuredData(dish: Dish) {
    const dishName = this.getDishName(dish);
    const dishDescription = this.getDishDescription(dish);

    // Remove existing structured data script if it exists
    const existingScript = this.document.getElementById('dish-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: dishName,
      description: dishDescription,
      image: dish.thumbnail ? [dish.thumbnail] : [],
      author: {
        '@type': 'Organization',
        name: 'What To Eat',
      },
      prepTime: dish.preparationTime ? `PT${dish.preparationTime}M` : undefined,
      cookTime: dish.cookingTime ? `PT${dish.cookingTime}M` : undefined,
      totalTime:
        dish.preparationTime && dish.cookingTime
          ? `PT${dish.preparationTime + dish.cookingTime}M`
          : undefined,
      recipeCategory: dish.mealCategories,
      recipeCuisine: 'Vietnamese',
      keywords: [...dish.mealCategories, ...dish.ingredientCategories].join(
        ', ',
      ),
      recipeIngredient: this.ingredients().map((ingredient) => {
        const dishIngredient = dish.ingredients.find(
          (di) => di.ingredientId === ingredient._id,
        );
        const ingredientName =
          ingredient.title?.find((n: any) => n.lang === this.localeId)?.data ||
          ingredient.title?.[0]?.data ||
          '';
        return dishIngredient
          ? `${dishIngredient.quantity} ${ingredientName}`
          : ingredientName;
      }),
      recipeInstructions:
        dish.content?.find((c: any) => c.lang === this.localeId)?.data ||
        dish.content?.[0]?.data ||
        '',
      video: dish.videos?.map((video) => ({
        '@type': 'VideoObject',
        embedUrl: video,
      })),
    };

    // Remove undefined values
    Object.keys(structuredData).forEach((key) => {
      if (structuredData[key as keyof typeof structuredData] === undefined) {
        delete structuredData[key as keyof typeof structuredData];
      }
    });

    const script = this.document.createElement('script');
    script.id = 'dish-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    this.document.head.appendChild(script);
  }

  getContent(): SafeHtml {
    const html =
      this.dish()?.content?.find((c: any) => c?.lang === this.localeId)?.data ||
      '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  copyLink() {
    navigator.clipboard.writeText(this.pageUrl());
    this.snackBar.open($localize`:@@copied:Copied!`, 'OK', { duration: 2000 });
  }

  goBack() {
    this.location.back();
  }

  categories = computed(() => [
    ...(this.dish()?.mealCategories || []),
    ...(this.dish()?.ingredientCategories || []),
  ]);

  youtubeId = computed(() => {
    const video = this.dish()?.videos?.[0];
    if (!video) return '';
    const match = video.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    return match ? match[1] : '';
  });

  // Video management signals
  currentVideoIndex = signal(0);

  currentVideoId = computed(() => {
    const videos = this.dish()?.videos;
    if (!videos || videos.length === 0) return '';

    const currentVideo = videos[this.currentVideoIndex()];
    if (!currentVideo) return '';

    const match = currentVideo.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    return match ? match[1] : '';
  });

  selectVideo(index: number): void {
    const videos = this.dish()?.videos;
    if (videos && index >= 0 && index < videos.length) {
      this.currentVideoIndex.set(index);
    }
  }

  onPlayerReady(event: any): void {
    // Player is ready - can add additional setup here if needed
  }

  onPlayerStateChange(event: any): void {
    // Handle player state changes if needed
  }

  getYouTubeThumbnail(videoUrl: string): string {
    const videoId = this.extractVideoId(videoUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  }

  onThumbnailError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Fallback to a simple play button SVG
      img.src =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA4MCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0zMiAyNEwxNiAyNEwxNiAzMkwzMiAzMloiBmaWxsPSIjOWNhM2FmIi8+CjxwYXRoIGQ9Ik0zMiAyNEw0OCAyNEw0OCAzMkwzMiAzMloiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTMyIDI0TDMyIDE2TDMyIDMyTDMyIDI0WiIgZmlsbD0iIzlhYzNhZiIvPgo8L3N2Zz4K';
    }
  }

  private extractVideoId(videoUrl: string): string {
    const match = videoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    return match ? match[1] : '';
  }

  get newUUID() {
    return uuidv4();
  }

  getQuantity(ingredient: Ingredient): string {
    const found = this.dish()?.ingredients?.find(
      (i) => i.ingredientId === ingredient._id,
    );
    if (!found) return '';
    return found.quantity.toString();
  }

  getNote(ingredient: Ingredient): string {
    const found = this.dish()?.ingredients?.find(
      (i) => i.ingredientId === ingredient._id,
    );
    if (!found) return '';
    return found.note;
  }

  private addOrUpdateCanonicalLink() {
    // Remove existing canonical link if it exists
    const existingCanonical = this.document.querySelector(
      'link[rel="canonical"]',
    );
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link with proper URL based on locale and dish slug
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');

    // Get dish slug from current route
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      const baseUrl = environment.BASE_URL;
      let canonicalUrl = baseUrl;

      if (this.localeId.startsWith('vi')) {
        canonicalUrl = `${baseUrl}/vi/dish/${slug}`;
      } else {
        canonicalUrl = `${baseUrl}/en/dish/${slug}`;
      }

      link.setAttribute('href', canonicalUrl);
      this.document.head.appendChild(link);
    }
  }

  private addHrefLangLinks() {
    // Remove existing hreflang links if they exist
    const existingHrefLangs = this.document.querySelectorAll(
      'link[rel="alternate"][hreflang]',
    );
    existingHrefLangs.forEach((link) => link.remove());

    // Get dish slug from current route
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    const baseUrl = environment.BASE_URL;

    // Add Vietnamese version
    const viLink = this.document.createElement('link');
    viLink.setAttribute('rel', 'alternate');
    viLink.setAttribute('hreflang', 'vi');
    viLink.setAttribute('href', `${baseUrl}/vi/dish/${slug}`);
    this.document.head.appendChild(viLink);

    // Add English version
    const enLink = this.document.createElement('link');
    enLink.setAttribute('rel', 'alternate');
    enLink.setAttribute('hreflang', 'en');
    enLink.setAttribute('href', `${baseUrl}/en/dish/${slug}`);
    this.document.head.appendChild(enLink);

    // Add x-default for default language
    const defaultLink = this.document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${baseUrl}/en/dish/${slug}`);
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
      'link[rel="canonical"]',
    );
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Clean up hreflang links
    const existingHrefLangs = this.document.querySelectorAll(
      'link[rel="alternate"][hreflang]',
    );
    existingHrefLangs.forEach((link) => link.remove());
  }
}
