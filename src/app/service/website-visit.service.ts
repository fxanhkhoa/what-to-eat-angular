import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
import { APIPagination } from '@/types/base.type';
import { WebsiteVisit } from '@/types/website_visit.type';

const prefix = 'website-visit';

@Injectable({ providedIn: 'root' })
export class WebsiteVisitService {
  constructor(private http: HttpClient) {}

  /**
   * Track website visit with real client IP
   * Automatically fetches the client's real IP address from ipify service
   * and sends it to the backend
   */
  trackVisit(): Observable<void> {
    return this.http
      .get<{ ip: string }>('https://robotic.dratini.tech/client-ip')
      .pipe(
        timeout(3000), // 3 second timeout
        catchError(() => of({ ip: '' })), // Fallback if service fails
        switchMap((response) => {
          const body = response.ip ? { ip: response.ip } : {};
          return this.http.post<void>(
            `${environment.API_URL}/${prefix}/visit`,
            body
          );
        })
      );
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
