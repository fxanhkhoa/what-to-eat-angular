import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import { DishAnalyze } from '@/types/dish-analyze.type';
import {
  CreateDishDto,
  Dish,
  QueryDishDto,
  UpdateDishDto,
} from '@/types/dish.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

const prefix = 'dish';

@Injectable({
  providedIn: 'root',
})
export class DishService {
  private http = inject(HttpClient);
  private slugCache = new Map<string, Observable<Dish>>();

  findAll(dto: QueryDishDto) {
    return this.http.get<APIPagination<Dish>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto,
      }
    );
  }

  // Enhanced search with scoring
  findWithScore(dto: QueryDishDto) {
    return this.http.get<APIPagination<Dish>>(
      `${environment.API_URL}/${prefix}/search`,
      {
        params: dto,
      }
    );
  }

  findWithFuzzy(dto: QueryDishDto) {
    return this.http.get<APIPagination<Dish>>(
      `${environment.API_URL}/${prefix}/search/fuzzy`,
      {
        params: dto,
      }
    );
  }

  // Get search suggestions
  getSuggestions(keyword: string, limit: number = 10) {
    return this.http.get<{suggestions: string[]}>(
      `${environment.API_URL}/${prefix}/suggestions`,
      {
        params: { keyword, limit: limit.toString() }
      }
    ).pipe(
      map(response => response.suggestions)
    );
  }

  findBySlug(slug: string) {
    if (this.slugCache.has(slug)) {
      return this.slugCache.get(slug)!;
    }
    const obs = this.http
      .get<Dish>(`${environment.API_URL}/${prefix}/slug/${slug}`)
      .pipe(shareReplay(1));
    this.slugCache.set(slug, obs);
    return obs;
  }

  findRandom(limit: number, mealCategories?: string[]) {
    return this.http.get<Dish[]>(`${environment.API_URL}/${prefix}/random`, {
      params: { limit: limit, mealCategories: mealCategories ?? [] },
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

  analyze() {
    return this.http.get<DishAnalyze>(`${environment.API_URL}/${prefix}/analyze`);
  }
}
