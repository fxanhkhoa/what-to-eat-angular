import { environment } from '@/environments/environment';
import { ResultToken } from '@/types/auth.type';
import { User } from '@/types/user.type';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const prefix = 'auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private profile: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {}

  login(token: string) {
    return this.http.post<ResultToken>(
      `${environment.API_URL}/${prefix}/login`,
      { token }
    );
  }

  refreshToken(refreshToken: string) {
    return this.http.post<ResultToken>(
      `${environment.API_URL}/${prefix}/refresh-token`,
      { refreshToken }
    );
  }

  logout(refreshToken: string) {
    return this.http.post<any>(`${environment.API_URL}/${prefix}/logout`, {
      refreshToken,
    });
  }

  getProfileAPI() {
    return this.http.get<User>(`${environment.API_URL}/${prefix}/profile`);
  }

  getProfile() {
    return this.profile.asObservable();
  }

  setProfile(profile: User | null) {
    this.profile.next(profile);
  }
}
