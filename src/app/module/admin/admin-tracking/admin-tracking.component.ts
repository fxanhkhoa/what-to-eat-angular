import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { WebsiteVisitService } from '@/app/service/website-visit.service';
import {
  ChartDataPoint,
  WebsiteVisit,
  WebsiteVisitAnalytics,
  WebsiteVisitFilter,
} from '@/types/website_visit.type';
import { APIPagination } from '@/types/base.type';

@Component({
  selector: 'app-admin-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    NgxChartsModule,
  ],
  templateUrl: './admin-tracking.component.html',
  styleUrls: ['./admin-tracking.component.scss'],
})
export class AdminTrackingComponent implements OnInit {
  private websiteVisitService = inject(WebsiteVisitService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  analytics: WebsiteVisitAnalytics | null = null;
  isLoadingAnalytics = false;
  isLoadingTable = false;
  legendPositionBelow: LegendPosition = LegendPosition.Below;

  // Selected time window
  selectedDays = 30;
  timeRangeOptions = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 14 Days', value: 14 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
  ];

  // Table filters
  selectedCountryFilter = '';
  selectedActionFilter = '';
  searchQuery = '';

  // Pagination & Sorting
  displayedColumns: string[] = [
    'country',
    'ip',
    'action',
    'path',
    'device',
    'visitedAt',
  ];
  dataSource = new MatTableDataSource<WebsiteVisit>();
  totalLogs = 0;
  page = 1;
  limit = 10;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) set sort(sort: MatSort | undefined) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  // Chart Color Schemes
  primaryColorScheme: Color = {
    name: 'primaryScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#6366F1',
      '#14B8A6',
      '#F97316',
      '#84CC16',
    ],
  };

  deviceColorScheme: Color = {
    name: 'deviceScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
  };

  browserColorScheme: Color = {
    name: 'browserScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6366F1', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#94A3B8'],
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAnalytics();
      this.loadLogs();
    }
  }

  loadAnalytics(): void {
    this.isLoadingAnalytics = true;
    this.websiteVisitService.getAnalytics(this.selectedDays).subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoadingAnalytics = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load analytics:', err);
        this.isLoadingAnalytics = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadLogs(page: number = this.page, limit: number = this.limit): void {
    this.isLoadingTable = true;
    const filter: WebsiteVisitFilter = {
      days: this.selectedDays,
    };
    if (this.selectedCountryFilter) {
      filter.country = this.selectedCountryFilter;
    }
    if (this.selectedActionFilter) {
      filter.action = this.selectedActionFilter;
    }
    if (this.searchQuery.trim()) {
      filter.search = this.searchQuery.trim();
    }

    this.websiteVisitService.findAll(page, limit, filter).subscribe({
      next: (res: APIPagination<WebsiteVisit>) => {
        this.dataSource.data = res?.data ? [...res.data] : [];
        this.totalLogs = res?.count ?? 0;
        this.isLoadingTable = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load visitor logs:', err);
        this.isLoadingTable = false;
        this.cdr.markForCheck();
      },
    });
  }

  onDaysChange(days: number): void {
    this.selectedDays = days;
    this.page = 1;
    this.loadAnalytics();
    this.loadLogs();
  }

  // Interactive Chart Click ("frontend when click")
  onCountrySelect(event: any): void {
    const countryName = typeof event === 'string' ? event : event?.name;
    if (countryName) {
      this.selectedCountryFilter = countryName;
      this.page = 1;
      this.loadLogs();
    }
  }

  onDeviceSelect(event: any): void {
    const deviceName = typeof event === 'string' ? event : event?.name;
    if (deviceName) {
      this.searchQuery = deviceName;
      this.page = 1;
      this.loadLogs();
    }
  }

  setActionFilter(action: string): void {
    this.selectedActionFilter = action;
    this.page = 1;
    this.loadLogs();
  }

  clearCountryFilter(): void {
    this.selectedCountryFilter = '';
    this.page = 1;
    this.loadLogs();
  }

  clearAllFilters(): void {
    this.selectedCountryFilter = '';
    this.selectedActionFilter = '';
    this.searchQuery = '';
    this.page = 1;
    this.loadLogs();
  }

  onSearch(): void {
    this.page = 1;
    this.loadLogs();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadLogs(this.page, this.limit);
  }

  refresh(): void {
    this.loadAnalytics();
    this.loadLogs();
  }

  getCountryFlag(code?: string): string {
    if (!code || code.length !== 2 || code === 'UN' || code === 'LOC') {
      return '🌐';
    }
    try {
      const codePoints = code
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '🌐';
    }
  }

  getDeviceIcon(device?: string): string {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return 'smartphone';
      case 'tablet':
        return 'tablet';
      default:
        return 'laptop';
    }
  }
}

