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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '@/app/shared/component/confirm-dialog/confirm-dialog.component';
import { AuthorizationService } from '@/app/service/authorization.service';
import {
  RolePermission,
  QueryRolePermissionDto,
} from '@/types/role_permission.type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-role-permission',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatChipsModule,
    MatDialogModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './admin-role-permission.component.html',
  styleUrl: './admin-role-permission.component.scss',
})
export class AdminRolePermissionComponent implements OnInit, AfterViewInit {
  private authorizationService = inject(AuthorizationService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'name',
    'description',
    'permissions',
    'actions',
  ];
  dataSource = new MatTableDataSource<RolePermission>();
  totalCount = 0;
  keyword = '';
  pageIndex = 0;
  pageSize = 10;
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
    const dto: QueryRolePermissionDto = {
      page: this.pageIndex,
      limit: this.pageSize,
      keyword: this.keyword || undefined,
    };

    this.authorizationService.findAll(dto).subscribe({
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
        console.error('Error loading role permissions', error);
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

  deleteRolePermission(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        mainMsg: 'Delete Role Permission',
        subMsg:
          'Are you sure you want to delete this role permission? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authorizationService.delete(id).subscribe({
          next: () => {
            this.loadData();
          },
          error: (error) => {
            console.error('Error deleting role permission', error);
          },
        });
      }
    });
  }
}
