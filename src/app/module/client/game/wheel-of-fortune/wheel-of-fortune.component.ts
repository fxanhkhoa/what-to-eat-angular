import { CommonModule, isPlatformServer, DOCUMENT } from '@angular/common';
import {
  Component,
  inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { WheelPlayerComponent } from './wheel-player/wheel-player.component';
import { DishService } from '@/app/service/dish.service';
import { Dish } from '@/types/dish.type';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { SelectedDishModalComponent } from '../selected-dish-modal/selected-dish-modal.component';
import { GameStateService } from '@/app/state/game-state.service';
import { finalize, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { WheelDishPickerComponent } from './wheel-dish-picker/wheel-dish-picker.component';

@Component({
  selector: 'app-wheel-of-fortune',
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    WheelPlayerComponent,
    MatProgressSpinnerModule,
    WheelDishPickerComponent,
  ],
  templateUrl: './wheel-of-fortune.component.html',
  styleUrl: './wheel-of-fortune.component.scss',
})
export class WheelOfFortuneComponent implements OnInit, OnDestroy {
  private dishService = inject(DishService);
  private dialog = inject(MatDialog);
  private gameStateService = inject(GameStateService);
  private platformId = inject(PLATFORM_ID);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  localeId = inject(LOCALE_ID);

  dishes = signal<Dish[]>([]);
  loading = signal<boolean>(false);
  private destroy$ = new Subject();

  ngOnInit(): void {
    this.setupSEO();
    this.addOrUpdateCanonicalLink();
    this.initialize();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);

    this.gameStateService.updateWheelOfFortuneState({
      selectedItem: null,
      items: this.dishes(),
    });

    // Clean up canonical link
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
  }

  initialize() {
    this.loading.set(true);
    if (isPlatformServer(this.platformId)) {
      this.dishes.set([]);
      return;
    }
    this.gameStateService
      .getGameState()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false)),
        switchMap((state) => {
          if (state.wheelOfFortune.selectedItem) {
            const result = this.dialog.open(SelectedDishModalComponent, {
              data: state.wheelOfFortune.selectedItem,
              width: '80vw',
            });

            result.afterClosed().subscribe((result) => {
              if (result) {
                const newItems = state.wheelOfFortune.items.filter(
                  (e) => e._id !== state.wheelOfFortune.selectedItem?._id
                );
                this.gameStateService.updateWheelOfFortuneState({
                  selectedItem: null,
                  items: newItems,
                });
              }
            });
          }
          if (state.wheelOfFortune.items.length > 0) {
            this.dishes.set(state.wheelOfFortune.items);
            this.loading.set(false);
            return of(null);
          } else {
            return this.dishService.findRandom(7);
          }
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.dishes.set(res);
        this.loading.set(false);
        this.gameStateService.updateWheelOfFortuneState({
          selectedItem: null,
          items: res,
        });
      });
  }

  goBack() {
    window.history.back();
  }

  private setupSEO() {
    const seo = {
      vi: {
        title: 'Vòng quay may mắn | What To Eat',
        description: 'Quay vòng may mắn để tìm món ăn ngẫu nhiên hấp dẫn cho bữa ăn tiếp theo của bạn tại What To Eat.',
        keywords: 'vòng quay may mắn, món ăn ngẫu nhiên, game ẩm thực, what to eat, chọn món ăn, vòng quay'
      },
      en: {
        title: 'Wheel of Fortune | What To Eat',
        description: 'Spin the wheel of fortune to discover random delicious dishes for your next meal at What To Eat.',
        keywords: 'wheel of fortune, random food, food game, what to eat, food picker, spin wheel'
      }
    };
    
    const lang = this.localeId === 'vi' ? 'vi' : 'en';
    this.titleService.setTitle(seo[lang].title);
    this.metaService.updateTag({ name: 'description', content: seo[lang].description });
    this.metaService.updateTag({ name: 'keywords', content: seo[lang].keywords });
    this.metaService.updateTag({ property: 'og:title', content: seo[lang].title });
    this.metaService.updateTag({ property: 'og:description', content: seo[lang].description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: seo[lang].title });
    this.metaService.updateTag({ name: 'twitter:description', content: seo[lang].description });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
  }

  private addOrUpdateCanonicalLink() {
    // Remove existing canonical link if it exists
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    this.document.head.appendChild(link);
  }
}
