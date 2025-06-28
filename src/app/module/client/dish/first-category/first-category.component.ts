import { DishService } from '@/app/service/dish.service';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-first-category',
  imports: [],
  templateUrl: './first-category.component.html',
  styleUrl: './first-category.component.scss',
})
export class FirstCategoryComponent implements OnInit {
  @Input() category: string = '';

  private route = inject(ActivatedRoute);
  private dishService = inject(DishService);
  page = 1;
  limit = 10;
  keyword = '';
  filter: any = {};

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.page = Number(params['page']) || 1;
      this.limit = Number(params['limit']) || 10;
    });
  }
}
