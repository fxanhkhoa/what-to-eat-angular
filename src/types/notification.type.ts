export type SegmentFilter = {
  roleNames?: string[];
  inactiveDays?: number;
};

export type NotificationTemplate = {
  _id: string;
  name: string;
  title: string;
  body: string;
  imageUrl?: string;
  type: 'chat' | 'activity' | 'marketing';
  data?: Record<string, string>;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
};

export type AdminNotificationLog = {
  _id: string;
  title: string;
  body: string;
  imageUrl?: string;
  type: string;
  data?: Record<string, string>;
  sentTo: 'all' | 'segment';
  segmentFilter?: SegmentFilter;
  scheduledAt?: string;
  sentAt?: string;
  totalSent: number;
  totalFailed: number;
  createdBy?: string;
};

export type SendBroadcastDto = {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  type: 'chat' | 'activity' | 'marketing';
  scheduledAt?: string;
};

export type SendSegmentDto = {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  type: 'chat' | 'activity' | 'marketing';
  scheduledAt?: string;
  segmentFilter: SegmentFilter;
};

export type CreateNotificationTemplateDto = {
  name: string;
  title: string;
  body: string;
  imageUrl?: string;
  type: 'chat' | 'activity' | 'marketing';
  data?: Record<string, string>;
};

export type UpdateNotificationTemplateDto = {
  name?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  type?: 'chat' | 'activity' | 'marketing';
  data?: Record<string, string>;
};
