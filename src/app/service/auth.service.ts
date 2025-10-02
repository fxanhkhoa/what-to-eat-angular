import { environment } from '@/environments/environment';
import { ResultToken } from '@/types/auth.type';
import { User } from '@/types/user.type';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';

const prefix = 'auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private profile: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Login with Google/Apple token and real client IP
   * Automatically fetches the client's real IP address from IP service
   * and sends it to the backend along with the token
   */
  login(token: string, type: string = 'google'): Observable<ResultToken> {
    return this.http
      .get<{ ip: string }>('https://robotic.dratini.tech/client-ip')
      .pipe(
        timeout(3000), // 3 second timeout
        catchError(() => of({ ip: '' })), // Fallback if service fails
        switchMap((response) => {
          const body: any = { token, type };
          if (response.ip) {
            body.ip = response.ip;
          }
          return this.http.post<ResultToken>(
            `${environment.API_URL}/${prefix}/login`,
            body
          );
        })
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
