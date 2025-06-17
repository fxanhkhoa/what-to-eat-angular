import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  CreateIngredientDto,
  Ingredient,
  QueryIngredientDto,
  UpdateIngredientDto,
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

  findRandom(limit: number, ingredientCategories?: string[]) {
    const queryParams: any = {
      limit: limit,
    };
    if (ingredientCategories && ingredientCategories.length > 0) {
      queryParams['ingredientCategory'] = ingredientCategories;
    }
    return this.http.get<Ingredient[]>(
      `${environment.API_URL}/${prefix}/random`,
      {
        params: queryParams,
      }
    );
  }

  create(ingredient: CreateIngredientDto) {
    return this.http.post<Ingredient>(
      `${environment.API_URL}/${prefix}`,
      ingredient
    );
  }

  update(id: string, ingredient: UpdateIngredientDto) {
    return this.http.patch<Ingredient>(
      `${environment.API_URL}/${prefix}/${id}`,
      ingredient
    );
  }

  findOne(id: string) {
    return this.http.get<Ingredient>(`${environment.API_URL}/${prefix}/${id}`);
  }

  delete(id: string) {
    return this.http.delete<Ingredient>(
      `${environment.API_URL}/${prefix}/${id}`
    );
  }
}
