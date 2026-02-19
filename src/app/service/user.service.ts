import { environment } from '@/environments/environment';
import { APIPagination, PagingDto } from '@/types/base.type';
import { CreateUserDto, QueryUserDto, UpdateUserDto, User } from '@/types/user.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

const prefix = 'user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private userCache = new Map<string, Observable<User>>();

  findOne(id: string) {
    if (this.userCache.has(id)) {
      return this.userCache.get(id)!;
    }
    const obs = this.http
      .get<User>(`${environment.API_URL}/${prefix}/${id}`)
      .pipe(shareReplay(1));
    this.userCache.set(id, obs);
    return obs;
  }

  findAll(paging?: PagingDto, query?: Partial<QueryUserDto>): Observable<APIPagination<User>> {
    let params: any = {};
    
    if (paging) {
      if (paging.page !== undefined) params.page = paging.page.toString();
      if (paging.limit !== undefined) params.limit = paging.limit.toString();
    }
    
    if (query) {
      if (query.keyword) params.keyword = query.keyword;
      if (query.email) params.email = query.email;
      if (query.phoneNumber) params.phoneNumber = query.phoneNumber;
      if (query.roleName && query.roleName.length > 0) params.roleName = query.roleName.join(',');
    }

    return this.http.get<APIPagination<User>>(`${environment.API_URL}/${prefix}`, { params });
  }

  create(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${environment.API_URL}/${prefix}`, user);
  }

  update(user: UpdateUserDto): Observable<User> {
    const { id, ...updateData } = user;
    return this.http.patch<User>(`${environment.API_URL}/${prefix}/${id}`, updateData);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/${prefix}/${id}`);
  }

  deleteUserData(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.API_URL}/${prefix}/${id}/data`);
  }
}
