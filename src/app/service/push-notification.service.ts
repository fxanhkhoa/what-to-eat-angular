import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  getToken,
  onMessage,
  deleteToken,
  Messaging,
} from '@angular/fire/messaging';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
  AdminNotificationLog,
  CreateNotificationTemplateDto,
  NotificationTemplate,
  SendBroadcastDto,
  SendSegmentDto,
  UpdateNotificationTemplateDto,
  SentToFilter,
} from '@/types/notification.type';
import { APIPagination } from '@/types/base.type';

export type NotificationItem = {
  _id: string;
  userId: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  type: 'chat' | 'activity' | 'marketing';
  sentAt?: string;
  readAt?: string;
  clickedAt?: string;
};

export type NotificationPreference = {
  _id?: string;
  userId: string;
  chatEnabled: boolean;
  activityEnabled: boolean;
  marketingEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
};

const prefix = 'notification';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private messaging: Messaging | null = isPlatformBrowser(inject(PLATFORM_ID))
    ? inject(Messaging, { optional: true })
    : null;

  private unreadCount$ = new BehaviorSubject<number>(0);
  unreadCount = this.unreadCount$.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId) && !this.messaging) {
      console.warn('[PushNotification] Firebase Messaging not available');
    }
  }

  /** Request browser notification permission */
  async requestPermission(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    if (typeof Notification === 'undefined') return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  /** Get FCM token and register it with the backend */
  async getAndRegisterToken(): Promise<string | null> {
    console.log('[PushNotification] Requesting FCM token');
    if (!this.messaging || !isPlatformBrowser(this.platformId)) return null;
    if (!('serviceWorker' in navigator)) {
      console.warn(
        '[PushNotification] Service workers are not supported in this browser',
      );
      return null;
    }
    try {
      const existingRegistration =
        (await navigator.serviceWorker.getRegistration(
          environment.SW_PATH,
        )) ??
        (await navigator.serviceWorker.register(environment.SW_PATH));
      const token = await getToken(this.messaging, {
        vapidKey: environment.VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: existingRegistration,
      });

      if (token) {
        const deviceInfo = `${navigator.userAgent.substring(0, 100)}`;
        this.http
          .post(`${environment.API_URL}/${prefix}/register-token/`, {
            token,
            platform: 'web',
            deviceInfo,
          })
          .subscribe();
      }
      return token;
    } catch (err) {
      console.error('[PushNotification] Error getting FCM token', err);
      return null;
    }
  }

  /** Listen for foreground messages */
  onForegroundMessage(): Observable<any> {
    return new Observable((observer) => {
      if (!this.messaging) {
        observer.complete();
        return;
      }
      const unsub = onMessage(this.messaging, (payload) => {
        observer.next(payload);
      });
      return unsub;
    });
  }

  /** Unregister FCM token and remove from backend */
  async deleteAndUnregisterToken(): Promise<void> {
    if (!this.messaging || !isPlatformBrowser(this.platformId)) return;
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.VAPID_PUBLIC_KEY,
      });
      if (token) {
        this.http
          .post(`${environment.API_URL}/${prefix}/unregister-token/`, { token })
          .subscribe();
        await deleteToken(this.messaging);
      }
    } catch (err) {
      console.error('[PushNotification] Error deleting FCM token', err);
    }
  }

  // ---- Notification history API ----

  getNotifications(
    page = 1,
    limit = 20,
  ): Observable<{ data: NotificationItem[]; count: number }> {
    return this.http.get<{ data: NotificationItem[]; count: number }>(
      `${environment.API_URL}/${prefix}/`,
      { params: { page, limit } },
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<{ count: number }>(`${environment.API_URL}/${prefix}/unread-count/`)
      .pipe(map((r) => r.count));
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (count) => this.unreadCount$.next(count),
      error: () => {},
    });
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(
      `${environment.API_URL}/${prefix}/${notificationId}/read/`,
      {},
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(
      `${environment.API_URL}/${prefix}/read-all/`,
      {},
    );
  }

  // ---- Preferences API ----

  getPreferences(): Observable<NotificationPreference> {
    return this.http.get<NotificationPreference>(
      `${environment.API_URL}/${prefix}/preferences/`,
    );
  }

  updatePreferences(
    dto: Partial<NotificationPreference>,
  ): Observable<NotificationPreference> {
    return this.http.put<NotificationPreference>(
      `${environment.API_URL}/${prefix}/preferences/`,
      dto,
    );
  }

  // ---- Admin: broadcast & segment ----

  sendBroadcast(dto: SendBroadcastDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.API_URL}/${prefix}/broadcast/`,
      dto,
    );
  }

  sendSegment(dto: SendSegmentDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.API_URL}/${prefix}/segment/`,
      dto,
    );
  }

  getAdminLogs(
    page = 1,
    limit = 20,
    sentTo?: SentToFilter,
  ): Observable<APIPagination<AdminNotificationLog>> {
    const params: Record<string, string | number> = { page, limit };
    if (sentTo) params['sentTo'] = sentTo;
    return this.http.get<APIPagination<AdminNotificationLog>>(
      `${environment.API_URL}/${prefix}/admin/logs/`,
      { params },
    );
  }

  // ---- Admin: templates ----

  getTemplates(page = 1, limit = 50): Observable<APIPagination<NotificationTemplate>> {
    return this.http.get<APIPagination<NotificationTemplate>>(
      `${environment.API_URL}/${prefix}/templates/`,
      { params: { page, limit } },
    );
  }

  createTemplate(dto: CreateNotificationTemplateDto): Observable<NotificationTemplate> {
    return this.http.post<NotificationTemplate>(
      `${environment.API_URL}/${prefix}/templates/`,
      dto,
    );
  }

  updateTemplate(id: string, dto: UpdateNotificationTemplateDto): Observable<NotificationTemplate> {
    return this.http.put<NotificationTemplate>(
      `${environment.API_URL}/${prefix}/templates/${id}/`,
      dto,
    );
  }

  deleteTemplate(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.API_URL}/${prefix}/templates/${id}/`,
    );
  }
}
