import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  CreateUserFavoriteDto,
  QueryUserFavoriteDto,
  UserFavorite,
} from '@/types/user-favorite.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const prefix = 'user-favorite';

@Injectable({
  providedIn: 'root',
})
export class UserFavoriteService {
  private http = inject(HttpClient);

  addFavorite(dto: CreateUserFavoriteDto): Observable<UserFavorite> {
    return this.http.post<UserFavorite>(
      `${environment.API_URL}/${prefix}`,
      dto
    );
  }

  getUserFavorites(dto: QueryUserFavoriteDto): Observable<APIPagination<UserFavorite>> {
    return this.http.get<APIPagination<UserFavorite>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto as any,
      }
    );
  }

  removeFavorite(dishSlug: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.API_URL}/${prefix}/${dishSlug}/`
    );
  }

  checkIsFavorite(dishSlug: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(
      `${environment.API_URL}/${prefix}/${dishSlug}/check/`
    );
  }
}
