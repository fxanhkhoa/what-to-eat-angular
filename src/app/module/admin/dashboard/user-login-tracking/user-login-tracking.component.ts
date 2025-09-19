import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserLoginTrack } from '@/types/user_login_track.type';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { UserLoginTrackService } from '@/app/service/user-login-track.service';
import { UserInfoComponent } from '@/app/components/user-info/user-info.component';
import { MatSort, MatSortModule, MatSortHeader } from '@angular/material/sort';

@Component({
  selector: 'app-user-login-tracking',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    DatePipe,
    UserInfoComponent,
    MatSortModule,
    MatSortHeader,
  ],
  templateUrl: './user-login-tracking.component.html',
  styleUrls: ['./user-login-tracking.component.scss'],
})
export class UserLoginTrackingComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['userId', 'loginAt', 'ip', 'userAgent'];
  dataSource = new MatTableDataSource<UserLoginTrack>();
  total = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userLoginTrackService: UserLoginTrackService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData() {
    this.userLoginTrackService
      .findAll({ page: this.pageIndex + 1, limit: this.pageSize })
      .subscribe((res) => {
        this.dataSource.data = res.data;
        this.total = res.count;
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  // TrackBy function for efficient rendering
  trackByFn(index: number, login: UserLoginTrack): string {
    // Use a combination of userId and loginAt as a unique identifier
    return `${login.userId}-${login.loginAt}`;
  }
}
