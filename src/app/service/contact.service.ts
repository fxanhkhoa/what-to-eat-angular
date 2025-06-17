import { environment } from '@/environments/environment';
import { APIPagination } from '@/types/base.type';
import {
  Contact,
  CreateContactDto,
  QueryContactDto,
  UpdateContactDto,
} from '@/types/contact.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

const prefix = 'contact';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private http = inject(HttpClient);

  findAll(dto: QueryContactDto) {
    return this.http.get<APIPagination<Contact>>(
      `${environment.API_URL}/${prefix}`,
      {
        params: dto,
      }
    );
  }

  create(dto: CreateContactDto) {
    return this.http.post<Contact>(`${environment.API_URL}/${prefix}`, dto);
  }

  update(id: string, dto: UpdateContactDto) {
    return this.http.patch<Contact>(
      `${environment.API_URL}/${prefix}/${id}`,
      dto
    );
  }

  findOne(id: string) {
    return this.http.get<Contact>(`${environment.API_URL}/${prefix}/${id}`);
  }

  delete(id: string) {
    return this.http.delete<Contact>(`${environment.API_URL}/${prefix}/${id}`);
  }
}
