import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { WebsiteVisitService } from '@/app/service/website-visit.service';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe, CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
  ],
  templateUrl: './website-visit.component.html',
  styleUrls: ['./website-visit.component.scss'],
})
export class WebsiteVisitComponent implements OnInit {
  private websiteVisitService = inject(WebsiteVisitService);

  displayedColumns: string[] = ['ip', 'userAgent', 'visitedAt'];
  dataSource = new MatTableDataSource<WebsiteVisit>();
  visitCount: number | null = null;
  isLoading = false;
  isLoadingPage = false;
  totalItems = 0;
  page = 1;
  limit = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadVisits();
    this.loadVisitCount();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
          // Use a more efficient update to reduce flickering
          this.dataSource.data = [...response.data]; // Create a new array reference
          this.totalItems = response.count;
          this.isLoading = false;
          this.isLoadingPage = false;
        },
        error: (error) => {
          console.error('Error loading visits:', error);
          this.isLoading = false;
          this.isLoadingPage = false;
        },
      });
  }

  loadVisitCount(): void {
    this.websiteVisitService.getVisitCount().subscribe({
      next: (res) => {
        this.visitCount = res.count;
      },
      error: (error) => {
        console.error('Error loading visit count:', error);
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
    // Use a combination of IP and visitedAt as a unique identifier
    return `${visit.ip}-${visit.visitedAt.getTime()}`;
  }
}
