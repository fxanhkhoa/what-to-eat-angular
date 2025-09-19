import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Observable } from 'rxjs';
import { APIPagination } from '@/types/base.type';
import { WebsiteVisit } from '@/types/website_visit.type';

const prefix = 'website-visit';

@Injectable({ providedIn: 'root' })
export class WebsiteVisitService {
  constructor(private http: HttpClient) {}

  trackVisit(): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/${prefix}/visit`, {});
  }

  getVisitCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${environment.API_URL}/${prefix}/visit/count`
    );
  }

  findAll(
    page: number = 1,
    limit: number = 10
  ): Observable<APIPagination<WebsiteVisit>> {
    return this.http.get<APIPagination<WebsiteVisit>>(
      `${environment.API_URL}/${prefix}/visit`,
      {
        params: { page: page.toString(), limit: limit.toString() },
      }
    );
  }
}
