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
import { CategoryBadgesComponent } from '../../../../shared/component/category-badges/category-badges.component';

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
  localeId = inject(LOCALE_ID);

  dish = signal<Dish | null>(null);
  ingredients = signal<any[]>([]);
  relatedDishes = signal<any[]>([]);
  pageUrl = signal('');

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
  }

  ngOnInit() {
    // Replace with your resolver/data fetching logic
    const data = this.route.snapshot.data;
    this.dish.set(data['dish']);
    this.ingredients.set(data['ingredients']);
    this.relatedDishes.set(data['relatedDishes']);
    this.pageUrl.set(data['pageUrl']);
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

  get categories() {
    return computed(() => [
      ...(this.dish()?.mealCategories || []),
      ...(this.dish()?.ingredientCategories || []),
    ]);
  }
}
