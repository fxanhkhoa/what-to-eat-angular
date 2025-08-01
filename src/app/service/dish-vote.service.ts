import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  CreateDishVoteDto,
  DishVote,
  DishVoteFilter,
} from '@/types/dish-vote.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

const prefix = 'dish-vote';

@Injectable({
  providedIn: 'root',
})
export class DishVoteService {
  private http = inject(HttpClient);

  findAll(dto: DishVoteFilter) {
    return this.http.get<APIPagination<DishVote>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto,
      }
    );
  }

  findById(id: string) {
    return this.http.get<DishVote>(`${environment.API_URL}/${prefix}/${id}`);
  }

  create(dto: CreateDishVoteDto) {
    return this.http.post<DishVote>(`${environment.API_URL}/${prefix}`, dto);
  }
}
