import { environment } from '@/environments/environment';
import { User } from '@/types/user.type';
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
}
