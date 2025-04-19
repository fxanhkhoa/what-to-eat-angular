import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  CreateIngredientDto,
  Ingredient,
  QueryIngredientDto,
} from '@/types/ingredient.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

const prefix = 'ingredient';
@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  private http = inject(HttpClient);

  findAll(dto: QueryIngredientDto) {
    return this.http.get<APIPagination<Ingredient>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto,
      }
    );
  }

  create(ingredient: CreateIngredientDto) {
    return this.http.post<Ingredient>(
      `${environment.API_URL}/${prefix}`,
      ingredient
    );
  }

  findOne(id: string) {
    return this.http.get<Ingredient>(`${environment.API_URL}/${prefix}/${id}`);
  }
}
