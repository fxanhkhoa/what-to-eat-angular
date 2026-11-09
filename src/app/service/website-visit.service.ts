import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
import { APIPagination } from '@/types/base.type';
import {
  TrackEventPayload,
  WebsiteVisit,
  WebsiteVisitAnalytics,
  WebsiteVisitFilter,
} from '@/types/website_visit.type';

const prefix = 'website-visit';

@Injectable({ providedIn: 'root' })
export class WebsiteVisitService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private getSessionId(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    try {
      let sid = sessionStorage.getItem('wte_session_id');
      if (!sid) {
        sid =
          's_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        sessionStorage.setItem('wte_session_id', sid);
      }
      return sid;
    } catch {
      return '';
    }
  }

  /**
   * Track website visit with real client IP
   * Automatically fetches the client's real IP address from ipify/dratini service
   * and sends it to the backend
   */
  trackVisit(
    path?: string,
    additionalPayload?: Partial<TrackEventPayload>
  ): Observable<void> {
    return this.http
      .get<{ ip: string }>('https://robotic.dratini.tech/client-ip')
      .pipe(
        timeout(3000), // 3 second timeout
        catchError(() => of({ ip: '' })), // Fallback if service fails
        switchMap((response) => {
          const body: Record<string, any> = {};
          if (response.ip) {
            body['ip'] = response.ip;
          }
          if (path) {
            body['path'] = path;
          }
          if (path || additionalPayload) {
            const sessionId = this.getSessionId();
            if (sessionId) {
              body['sessionId'] = sessionId;
            }
          }
          if (additionalPayload) {
            Object.assign(body, additionalPayload);
          }
          return this.http.post<void>(
            `${environment.API_URL}/${prefix}/visit`,
            body
          );
        })
      );
  }

  /**
   * Track click / user interaction
   */
  trackClick(target: string, path?: string): Observable<void> {
    const currentPath =
      path ||
      (isPlatformBrowser(this.platformId) ? window.location.pathname : '');
    return this.trackVisit(currentPath, {
      action: 'click',
      target,
    });
  }

  getVisitCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${environment.API_URL}/${prefix}/visit/count`
    );
  }

  getAnalytics(days: number = 30): Observable<WebsiteVisitAnalytics> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<WebsiteVisitAnalytics>(
      `${environment.API_URL}/${prefix}/visit/analytics`,
      { params }
    );
  }

  findAll(
    page: number = 1,
    limit: number = 10,
    filters?: WebsiteVisitFilter
  ): Observable<APIPagination<WebsiteVisit>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.country) {
      params = params.set('country', filters.country);
    }
    if (filters?.action) {
      params = params.set('action', filters.action);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.days) {
      params = params.set('days', filters.days.toString());
    }

    return this.http.get<APIPagination<WebsiteVisit>>(
      `${environment.API_URL}/${prefix}/visit`,
      { params }
    );
  }
}
