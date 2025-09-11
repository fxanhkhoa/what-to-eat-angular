import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserLoginTrack } from '@/types/user_login_track.type';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { UserLoginTrackService } from '@/app/service/user-login-track.service';
import { UserInfoComponent } from '@/app/components/user-info/user-info.component';

@Component({
  selector: 'app-user-login-tracking',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    DatePipe,
    UserInfoComponent,
  ],
  templateUrl: './user-login-tracking.component.html',
  styleUrls: ['./user-login-tracking.component.scss'],
})
export class UserLoginTrackingComponent implements OnInit {
  displayedColumns: string[] = ['userId', 'loginAt', 'ip', 'userAgent'];
  dataSource: UserLoginTrack[] = [];
  total = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userLoginTrackService: UserLoginTrackService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.userLoginTrackService
      .findAll({ page: this.pageIndex + 1, limit: this.pageSize })
      .subscribe((res) => {
        this.dataSource = res.data;
        this.total = res.count;
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }
}
