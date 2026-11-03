import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  AddDishToCollectionDto,
  CreateUserDishCollectionDto,
  DuplicateCollectionDto,
  QueryUserDishCollectionDto,
  RemoveDishFromCollectionDto,
  ReorderDishesInCollectionDto,
  ShareCollectionDto,
  UpdateUserDishCollectionDto,
  UserDishCollection,
} from '@/types/user-dish-collection.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const prefix = 'user-dish-collection';

@Injectable({
  providedIn: 'root',
})
export class UserDishCollectionService {
  private http = inject(HttpClient);

  findAll(dto: QueryUserDishCollectionDto): Observable<APIPagination<UserDishCollection>> {
    return this.http.get<APIPagination<UserDishCollection>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: { ...dto },
      }
    );
  }

  findById(id: string): Observable<UserDishCollection> {
    return this.http.get<UserDishCollection>(
      `${environment.API_URL}/${prefix}/${id}`
    );
  }

  create(dto: CreateUserDishCollectionDto): Observable<UserDishCollection> {
    return this.http.post<UserDishCollection>(
      `${environment.API_URL}/${prefix}`,
      dto
    );
  }

  update(dto: UpdateUserDishCollectionDto): Observable<UserDishCollection> {
    return this.http.put<UserDishCollection>(
      `${environment.API_URL}/${prefix}/${dto._id}`,
      dto
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/${prefix}/${id}`);
  }

  addDish(dto: AddDishToCollectionDto): Observable<UserDishCollection> {
    return this.http.post<UserDishCollection>(
      `${environment.API_URL}/${prefix}/${dto.collectionId}/dishes`,
      dto
    );
  }

  removeDish(dto: RemoveDishFromCollectionDto): Observable<UserDishCollection> {
    return this.http.delete<UserDishCollection>(
      `${environment.API_URL}/${prefix}/${dto.collectionId}/dishes/${dto.dishSlug}`
    );
  }

  reorderDishes(dto: ReorderDishesInCollectionDto): Observable<UserDishCollection> {
    return this.http.put<UserDishCollection>(
      `${environment.API_URL}/${prefix}/${dto.collectionId}/reorder`,
      dto
    );
  }

  duplicate(dto: DuplicateCollectionDto): Observable<UserDishCollection> {
    return this.http.post<UserDishCollection>(
      `${environment.API_URL}/${prefix}/${dto.collectionId}/duplicate`,
      dto
    );
  }

  share(dto: ShareCollectionDto): Observable<void> {
    return this.http.post<void>(
      `${environment.API_URL}/${prefix}/${dto.collectionId}/share`,
      dto
    );
  }
}
