export type WebsiteVisit = {
  id?: string;
  _id?: string;
  ip: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  path?: string;
  action?: 'visit' | 'click' | string;
  target?: string;
  sessionId?: string;
  referrer?: string;
  visitedAt: Date;
};

export type ChartDataPoint = {
  name: string;
  value: number;
  code?: string;
};

export type WebsiteVisitAnalytics = {
  totalVisits: number;
  totalClicks: number;
  uniqueVisitors: number;
  todayVisits: number;
  todayClicks: number;
  visitsByCountry: ChartDataPoint[];
  visitsByCity: ChartDataPoint[];
  visitsByDevice: ChartDataPoint[];
  visitsByBrowser: ChartDataPoint[];
  visitsByOS: ChartDataPoint[];
  visitsOverTime: ChartDataPoint[];
  topPages: ChartDataPoint[];
  topClicks: ChartDataPoint[];
};

export type TrackEventPayload = {
  ip?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  browser?: string;
  os?: string;
  device?: string;
  path?: string;
  action?: 'visit' | 'click' | string;
  target?: string;
  sessionId?: string;
  referrer?: string;
};

export type WebsiteVisitFilter = {
  country?: string;
  action?: string;
  search?: string;
  days?: number;
};
