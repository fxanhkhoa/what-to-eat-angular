import { Dish } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dish-basic',
  imports: [CommonModule],
  templateUrl: './dish-basic.component.html',
  styleUrl: './dish-basic.component.scss',
})
export class DishBasicComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  rows: Dish[] = []
  currentPage = 1

  ngOnInit(): void {
    this.setupMetaTags();
  }

  setupMetaTags(): void {
    this.titleService.setTitle($localize`dishes-title`);
    this.metaService.updateTag({
      name: 'description',
      content: $localize`dishes-description`,
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
}
