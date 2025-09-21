import { environment } from '@/environments/environment';
import { RolePermission } from '@/types/auth.type';
import { APIPagination } from '@/types/base.type';
import { QueryRolePermissionDto, CreateRolePermissionDto, UpdateRolePermissionDto } from '@/types/role_permission.type';
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

  findAll(dto: QueryRolePermissionDto) {
    return this.http.get<APIPagination<RolePermission>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto,
      }
    );
  }

  create(dto: CreateRolePermissionDto) {
    return this.http.post<RolePermission>(
      `${environment.API_URL}/${prefix}`,
      dto
    );
  }

  update(id: string, dto: UpdateRolePermissionDto) {
    return this.http.patch<RolePermission>(
      `${environment.API_URL}/${prefix}/${id}`,
      dto
    );
  }

  findOne(id: string) {
    return this.http.get<RolePermission>(
      `${environment.API_URL}/${prefix}/${id}`
    );
  }

  delete(id: string) {
    return this.http.delete<RolePermission>(
      `${environment.API_URL}/${prefix}/${id}`
    );
  }
}
