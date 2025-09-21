import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ViewChild,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '@/app/shared/component/confirm-dialog/confirm-dialog.component';
import { UserService } from '@/app/service/user.service';
import { User, QueryUserDto } from '@/types/user.type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-user',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './admin-user.component.html',
  styleUrl: './admin-user.component.scss',
})
export class AdminUserComponent implements OnInit, AfterViewInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'name',
    'email',
    'phone',
    'roleName',
    'createdAt',
    'actions',
  ];
  dataSource = new MatTableDataSource<User>();
  totalCount = 0;
  keyword = '';
  pageIndex = 0;
  pageSize = 5;
  private platformId = inject(PLATFORM_ID);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadData() {
    const dto: Partial<QueryUserDto> = {};
    if (this.keyword) {
      dto.keyword = this.keyword;
    }

    this.userService
      .findAll({ page: this.pageIndex + 1, limit: this.pageSize }, dto)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          this.totalCount = response.count;

          if (this.paginator) {
            this.paginator.length = response.count;
          }

          setTimeout(() => {
            this.dataSource.sort = this.sort;
          }, 500);
        },
        error: (error) => {
          console.error('Error loading users', error);
        },
      });
  }

  onSearch() {
    this.pageIndex = 0;
    this.loadData();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  deleteUser(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        mainMsg: 'Delete User',
        subMsg:
          'Are you sure you want to delete this user? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.remove(id).subscribe({
          next: () => {
            this.loadData();
          },
          error: (error) => {
            console.error('Error deleting user', error);
          },
        });
      }
    });
  }
}
