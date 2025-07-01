import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { Dish } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  LOCALE_ID,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dish-card-fancy',
  imports: [
    CommonModule,
    MatCardModule,
    MultiLanguagePipe,
    MatIconModule,
    MatTooltipModule,
    CategoryTranslatePipe,
  ],
  templateUrl: './dish-card-fancy.component.html',
  styleUrl: './dish-card-fancy.component.scss',
})
export class DishCardFancyComponent implements OnInit {
  @Input() dish!: Dish;

  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  localeId = inject(LOCALE_ID);

  backgroundList = [
    '/assets/images/food-card-bg-1.jpg',
    '/assets/images/food-card-bg-2.jpg',
    '/assets/images/food-card-bg-3.jpg',
    '/assets/images/food-card-bg-4.png',
  ];

  selectedBackground = signal('');

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

  ngOnInit(): void {
    const randomIndex = Math.floor(Math.random() * this.backgroundList.length);
    this.selectedBackground.set(`background-image: url("${this.backgroundList[randomIndex]}") !important;`);
  }
}
