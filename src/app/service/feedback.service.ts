import { environment } from '@/environments/environment';
import {
  Feedback,
  CreateFeedbackDto,
  UpdateFeedbackDto,
  FeedbackListDto,
  FeedbackPaginationResponse,
} from '@/types/feedback.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const prefix = 'feedback';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private http = inject(HttpClient);

  /**
   * Create feedback (public endpoint - no authentication required)
   */
  create(dto: CreateFeedbackDto): Observable<Feedback> {
    return this.http.post<Feedback>(`${environment.API_URL}/${prefix}`, dto);
  }

  /**
   * Get all feedbacks with pagination and filters (requires authentication)
   */
  findAll(dto: FeedbackListDto): Observable<FeedbackPaginationResponse> {
    let params = new HttpParams();
    
    if (dto.page) {
      params = params.set('page', dto.page.toString());
    }
    if (dto.limit) {
      params = params.set('limit', dto.limit.toString());
    }
    if (dto.rating) {
      params = params.set('rating', dto.rating.toString());
    }
    if (dto.email) {
      params = params.set('email', dto.email);
    }

    return this.http.get<FeedbackPaginationResponse>(
      `${environment.API_URL}/${prefix}`,
      { params }
    );
  }

  /**
   * Get a specific feedback by ID (requires authentication)
   */
  findOne(id: string): Observable<Feedback> {
    return this.http.get<Feedback>(`${environment.API_URL}/${prefix}/${id}`);
  }

  /**
   * Update own feedback (requires authentication)
   */
  update(id: string, dto: UpdateFeedbackDto): Observable<Feedback> {
    return this.http.patch<Feedback>(
      `${environment.API_URL}/${prefix}/${id}`,
      dto
    );
  }

  /**
   * Delete own feedback (requires authentication)
   */
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.API_URL}/${prefix}/${id}`
    );
  }
}
