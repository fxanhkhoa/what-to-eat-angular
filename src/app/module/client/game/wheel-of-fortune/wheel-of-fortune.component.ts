import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { WheelPlayerComponent } from './wheel-player/wheel-player.component';
import { DishService } from '@/app/service/dish.service';
import { Dish } from '@/types/dish.type';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-wheel-of-fortune',
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    WheelPlayerComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './wheel-of-fortune.component.html',
  styleUrl: './wheel-of-fortune.component.scss',
})
export class WheelOfFortuneComponent implements OnInit {
  private dishService = inject(DishService);

  dishes = signal<Dish[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.getDishes();
  }

  getDishes() {
    this.loading.set(true);
    this.dishService
      .findRandom(7)
      .pipe()
      .subscribe((res) => {
        this.dishes.set(res);
        this.loading.set(false);
      });
  }

  goBack() {
    window.history.back();
  }
}
