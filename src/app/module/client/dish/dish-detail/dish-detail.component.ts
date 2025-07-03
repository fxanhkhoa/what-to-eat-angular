import {
  Component,
  inject,
  signal,
  computed,
  effect,
  LOCALE_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
import { Ingredient } from '@/types/ingredient.type';
import { finalize, forkJoin, mergeMap, of } from 'rxjs';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { DishCardFancyComponent } from '../dish-card-fancy/dish-card-fancy.component';

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
  // Add imports for Angular Material, child components, etc.
})
export class DishDetailComponent {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private iconRegistry = inject(MatIconRegistry);
  private ingredientService = inject(IngredientService);
  private dishService = inject(DishService);
  localeId = inject(LOCALE_ID);

  dish = signal<Dish | null>(null);
  ingredients = signal<Ingredient[]>([]);
  relatedDishes = signal<Dish[]>([]);
  pageUrl = signal('');
  loading = signal<boolean>(false);

  constructor() {
    this.iconRegistry.addSvgIcon(
      'easy',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/easy.svg')
    );
    this.iconRegistry.addSvgIcon(
      'medium',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/medium.svg')
    );
    this.iconRegistry.addSvgIcon(
      'hard',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/hard.svg')
    );
    this.iconRegistry.addSvgIcon(
      'cooking_time',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/cooking_time.svg'
      )
    );
    this.iconRegistry.addSvgIcon(
      'preparation_time',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/icons/preparation_time.svg'
      )
    );
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

  ngOnInit() {
    const data = this.route.snapshot.data;
    this.pageUrl.set(data['pageUrl']);
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.getData(slug);
      }
    });
  }

  get dishThumbUrl() {
    return computed(() => {
      const dish = this.dish();
      if (!dish || !dish.thumbnail) return '';
      return `url("${dish.thumbnail}")`;
    });
  }

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
              this.dishService.findOne(relatedDish)
            ) ?? [];
          const ingredientObservables =
            dish.ingredients?.map((ingredient) =>
              this.ingredientService.findOne(ingredient.ingredientId)
            ) ?? [];

          return forkJoin([...dishObservables, ...ingredientObservables]).pipe(
            // Pass lengths along for later use
            mergeMap((results) => {
              const relatedDishesLength = dishObservables.length;

              const relatedDishes = results.slice(0, relatedDishesLength);
              const ingredients = results.slice(relatedDishesLength);

              this.relatedDishes.set(relatedDishes as Dish[]);
              this.ingredients.set(ingredients as Ingredient[]);
              return of(dish);
            })
          );
        })
      )
      .subscribe((dish) => {
        if (dish) {
          this.dish.set(dish);
        }
      });
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
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return match ? match[1] : '';
  });

  get newUUID() {
    return uuidv4();
  }

  getQuantity(ingredient: Ingredient): string {
    const found = this.dish()?.ingredients?.find(
      (i) => i.ingredientId === ingredient._id
    );
    if (!found) return '';
    return found.quantity.toString();
  }

  getNote(ingredient: Ingredient): string {
    const found = this.dish()?.ingredients?.find(
      (i) => i.ingredientId === ingredient._id
    );
    if (!found) return '';
    return found.note;
  }
}
