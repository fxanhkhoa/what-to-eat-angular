import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  QueryUserLoginTrackDto,
  UserLoginTrack,
} from '@/types/user_login_track.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

const prefix = 'user-login-track';

@Injectable({
  providedIn: 'root',
})
export class UserLoginTrackService {
  private http = inject(HttpClient);

  findAll(dto: QueryUserLoginTrackDto) {
    return this.http.get<APIPagination<UserLoginTrack>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto,
      }
    );
  }
}
