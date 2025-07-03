import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  CreateDishDto,
  Dish,
  QueryDishDto,
  UpdateDishDto,
} from '@/types/dish.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

const prefix = 'dish';

@Injectable({
  providedIn: 'root',
})
export class DishService {
  private http = inject(HttpClient);

  findAll(dto: QueryDishDto) {
    return this.http.get<APIPagination<Dish>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto,
      }
    );
  }

  findBySlug(slug: string) {
    return this.http.get<Dish>(`${environment.API_URL}/${prefix}/slug/${slug}`);
  }

  findRandom(limit: number) {
    return this.http.get<Dish[]>(`${environment.API_URL}/${prefix}/random`, {
      params: { limit: limit },
    });
  }

  create(dto: CreateDishDto) {
    return this.http.post<Dish>(`${environment.API_URL}/${prefix}`, dto);
  }

  update(id: string, dto: UpdateDishDto) {
    return this.http.patch<Dish>(`${environment.API_URL}/${prefix}/${id}`, dto);
  }

  findOne(id: string) {
    return this.http.get<Dish>(`${environment.API_URL}/${prefix}/${id}`);
  }

  delete(id: string) {
    return this.http.delete<Dish>(`${environment.API_URL}/${prefix}/${id}`);
  }
}
