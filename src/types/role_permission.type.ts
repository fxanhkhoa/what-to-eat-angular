import { PagingDto } from "./base.type";

export type RolePermission = {
  _id: string;
  name: string;
  permission?: string[];
  description?: string;
  deleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdAt?: string;
  createdBy?: string;
}

export type CreateRolePermissionDto = {
  name: string;
  permission?: string[];
  description?: string;
}

export type UpdateRolePermissionDto = {
  id: string;
  name: string;
  permission?: string[];
  description?: string;
}

export type QueryRolePermissionDto = {
  keyword?: string;
} & PagingDto;
