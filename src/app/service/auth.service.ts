import { environment } from '@/environments/environment';
import { ResultToken } from '@/types/auth.type';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const prefix = 'auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(token: string) {
    return this.http.post<ResultToken>(
      `${environment.API_URL}/${prefix}/login`,
      { token }
    );
  }
}
