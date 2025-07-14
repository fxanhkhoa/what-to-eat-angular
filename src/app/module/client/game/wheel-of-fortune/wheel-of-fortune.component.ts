import { CommonModule, isPlatformServer } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
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
  ngOnDestroy(): void {
    this.destroy$.next(null);

    this.gameStateService.updateWheelOfFortuneSelectedItem({
      selectedItem: null,
      items: this.dishes(),
    });
  }

  private dishService = inject(DishService);
  private dialog = inject(MatDialog);
  private gameStateService = inject(GameStateService);
  private platformId = inject(PLATFORM_ID);

  dishes = signal<Dish[]>([]);
  loading = signal<boolean>(false);
  private destroy$ = new Subject();

  ngOnInit(): void {
    this.initialize();
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

            if (result) {
              const newItems = state.wheelOfFortune.items.filter(
                (e) => e._id !== state.wheelOfFortune.selectedItem?._id
              );
              this.gameStateService.updateWheelOfFortuneSelectedItem({
                selectedItem: null,
                items: newItems,
              });
            }
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
        this.gameStateService.updateWheelOfFortuneSelectedItem({
          selectedItem: null,
          items: res,
        });
      });
  }

  goBack() {
    window.history.back();
  }
}
