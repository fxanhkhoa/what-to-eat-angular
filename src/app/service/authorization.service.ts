import { environment } from '@/environments/environment';
import { RolePermission } from '@/types/auth.type';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const prefix = 'authorization';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  constructor(private http: HttpClient) {}

  findByName(name: string) {
    return this.http.get<RolePermission>(
      `${environment.API_URL}/${prefix}/by-name/${name}`
    );
  }
}
