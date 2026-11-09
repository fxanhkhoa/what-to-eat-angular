import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { WebsiteVisitService } from '@/app/service/website-visit.service';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe, CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { WebsiteVisit } from '@/types/website_visit.type';
import { APIPagination } from '@/types/base.type';

@Component({
  selector: 'app-website-visit',
  standalone: true,
  imports: [
    MatCardModule,
    DecimalPipe,
    CommonModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './website-visit.component.html',
  styleUrls: ['./website-visit.component.scss'],
})
export class WebsiteVisitComponent implements OnInit {
  private websiteVisitService = inject(WebsiteVisitService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  displayedColumns: string[] = ['ip', 'userAgent', 'visitedAt'];
  dataSource = new MatTableDataSource<WebsiteVisit>();
  visitCount: number | null = null;
  isLoading = false;
  isLoadingPage = false;
  totalItems = 0;
  page = 1;
  limit = 10;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) set sort(sort: MatSort | undefined) {
    if (sort) {
      this.dataSource.sort = sort;
      this.dataSource.sortingDataAccessor = (
        item: WebsiteVisit,
        property: string
      ): string | number => {
        if (property === 'visitedAt') {
          return new Date(item.visitedAt).getTime();
        }
        return item[property as keyof WebsiteVisit] as string;
      };
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadVisits();
      this.loadVisitCount();
    }
  }

  loadVisits(page: number = 1, limit: number = 10): void {
    const isInitialLoad = page === 1 && this.dataSource.data.length === 0;
    if (isInitialLoad) {
      this.isLoading = true;
    } else {
      this.isLoadingPage = true;
    }
    
    this.websiteVisitService
      .findAll(page, limit)
      .subscribe({
        next: (response: APIPagination<WebsiteVisit>) => {
          this.dataSource.data = response?.data ? [...response.data] : [];
          this.totalItems = response?.count ?? 0;
          this.isLoading = false;
          this.isLoadingPage = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading visits:', error);
          this.isLoading = false;
          this.isLoadingPage = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadVisitCount(): void {
    this.websiteVisitService.getVisitCount().subscribe({
      next: (res) => {
        this.visitCount = res?.count ?? 0;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading visit count:', error);
        this.cdr.markForCheck();
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.isLoadingPage = true; // Set loading state for pagination
    this.loadVisits(this.page, this.limit);
  }

  refresh(): void {
    this.loadVisits();
    this.loadVisitCount();
  }

  // TrackBy function for efficient rendering
  trackByVisitId(index: number, visit: WebsiteVisit): string {
    const time = visit?.visitedAt ? new Date(visit.visitedAt).getTime() : index;
    return `${visit?.ip ?? ''}-${time}`;
  }
}
