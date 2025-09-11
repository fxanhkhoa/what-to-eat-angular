import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DishService } from '@/app/service/dish.service';
import { DishAnalyze } from '@/types/dish-analyze.type';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';
import { C } from '@angular/cdk/keycodes';
import { COLOR_PALETTE } from '@/constant/color.constant';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dish-analytic',
  imports: [NgxChartsModule, MatCardModule],
  templateUrl: './dish-analytic.component.html',
  styleUrls: ['./dish-analytic.component.scss'],
})
export class DishAnalyticComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private dishService = inject(DishService);

  dishAnalyze?: DishAnalyze;
  categoryData: any[] = [];
  difficultyData: any[] = [];
  avgCookingTime = 0;
  avgPreparationTime = 0;

  // Tailwind-inspired color scheme
  // colorScheme = 'cool';
  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      ...COLOR_PALETTE,
      ...COLOR_PALETTE,
      ...COLOR_PALETTE,
      ...COLOR_PALETTE,
      ...COLOR_PALETTE,
    ],
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dishService.analyze().subscribe((data) => {
        this.dishAnalyze = data;
        this.categoryData = data.categoryDistribution
          .sort((a, b) => b.count - a.count)
          .map((item) => ({ name: $localize`${item._id}`, value: item.count }));
        this.difficultyData = data.difficultyLevels.map((item) => ({
          name: $localize`${item._id}`,
          value: item.count,
        }));
        if (data.avgTimes.length) {
          this.avgCookingTime = Math.round(data.avgTimes[0].avgCookingTime);
          this.avgPreparationTime = Math.round(
            data.avgTimes[0].avgPreparationTime
          );
        }
      });
    }
  }
}
