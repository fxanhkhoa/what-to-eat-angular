import { Dish, QueryDishDto } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Meta, Title } from '@angular/platform-browser';
import { DishFilterComponent } from '../dish-filter/dish-filter.component';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { EmptyComponent } from "@/app/components/empty/empty.component";

@Component({
  selector: 'app-dish-basic',
  imports: [
    CommonModule,
    MatButtonModule,
    DishFilterComponent,
    MatIconModule,
    MatExpansionModule,
    EmptyComponent
],
  templateUrl: './dish-basic.component.html',
  styleUrl: './dish-basic.component.scss',
})
export class DishBasicComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  rows: Dish[] = [];
  currentPage = 1;

  ngOnInit(): void {
    this.setupMetaTags();
  }

  setupMetaTags(): void {
    this.titleService.setTitle(
      $localize`The Ultimate Food Guide: What to Eat Now`
    );
    this.metaService.updateTag({
      name: 'description',
      content: $localize`Hungry? Discover delicious dishes, restaurant recommendations, and food guides
            for every craving. Find your next meal!`,
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'ăn gì, what to eat, eat what, ăn chi',
    });
    this.metaService.updateTag({ name: 'robots', content: 'index,follow' });
  }

  goBack() {
    window.history.back();
  }

  onSearch(dto: QueryDishDto) {
    console.log(dto);
  }
}
