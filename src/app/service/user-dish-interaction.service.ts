import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  QueryUserDishInteractionDto,
  RecordDishCookedDto,
  RecordDishSharedDto,
  RecordDishViewDto,
  RateDishDto,
  UserDishInteraction,
} from '@/types/user-dish-interaction.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const prefix = 'user-dish-interaction';

@Injectable({
  providedIn: 'root',
})
export class UserDishInteractionService {
  private http = inject(HttpClient);

  recordView(dto: RecordDishViewDto): Observable<UserDishInteraction> {
    return this.http.post<UserDishInteraction>(
      `${environment.API_URL}/${prefix}/view/`,
      dto
    );
  }

  recordCooked(dto: RecordDishCookedDto): Observable<UserDishInteraction> {
    return this.http.post<UserDishInteraction>(
      `${environment.API_URL}/${prefix}/cooked/`,
      dto
    );
  }

  rateDish(dto: RateDishDto): Observable<UserDishInteraction> {
    return this.http.post<UserDishInteraction>(
      `${environment.API_URL}/${prefix}/rate/`,
      dto
    );
  }

  recordShare(dto: RecordDishSharedDto): Observable<UserDishInteraction> {
    return this.http.post<UserDishInteraction>(
      `${environment.API_URL}/${prefix}/share/`,
      dto
    );
  }

  getUserInteractions(
    dto: QueryUserDishInteractionDto
  ): Observable<APIPagination<UserDishInteraction>> {
    return this.http.get<APIPagination<UserDishInteraction>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto as any,
      }
    );
  }

  getTopInteractedDishes(
    dto: QueryUserDishInteractionDto
  ): Observable<APIPagination<UserDishInteraction>> {
    return this.http.get<APIPagination<UserDishInteraction>>(
      `${environment.API_URL}/${prefix}/top/`,
      {
        params: dto as any,
      }
    );
  }
}
