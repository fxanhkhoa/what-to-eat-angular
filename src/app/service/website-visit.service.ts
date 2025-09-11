import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Observable } from 'rxjs';

const prefix = 'website-visit';

@Injectable({ providedIn: 'root' })
export class WebsiteVisitService {
  constructor(private http: HttpClient) {}

  trackVisit(): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/${prefix}/visit`, {});
  }

  getVisitCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.API_URL}/${prefix}/visit/count`);
  }
}
