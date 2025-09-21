import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ContactService } from '@/app/service/contact.service';
import { Contact, QueryContactDto } from '@/types/contact.type';
import { finalize } from 'rxjs';
import { ContactDetailsDialogComponent } from './contact-details-dialog/contact-details-dialog.component';

@Component({
  selector: 'app-admin-contact',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    FormsModule,
  ],
  templateUrl: './admin-contact.component.html',
  styleUrl: './admin-contact.component.scss',
})
export class AdminContactComponent implements OnInit {
  private contactService = inject(ContactService);
  private dialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'name',
    'email',
    'message',
    'createdAt',
    'actions',
  ];
  dataSource = new MatTableDataSource<Contact>([]);
  loading = signal(false);
  searchQuery = signal('');
  totalCount = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);

  // Computed signals for stats
  totalContacts = computed(() => this.dataSource.data.length);
  activeContacts = computed(
    () => this.dataSource.data.filter((c) => !c.deleted).length
  );
  thisMonthContacts = computed(() => {
    const now = new Date();
    return this.dataSource.data.filter((c) => {
      const contactDate = new Date(c.createdAt);
      return (
        contactDate.getMonth() === now.getMonth() &&
        contactDate.getFullYear() === now.getFullYear()
      );
    }).length;
  });

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.loadContacts();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadContacts() {
    this.loading.set(true);
    const query: QueryContactDto = {
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
    };

    this.contactService
      .findAll(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          this.totalCount.set(response.count);

          if (this.paginator) {
            this.paginator.length = response.count;
          }

          setTimeout(() => {
            this.dataSource.sort = this.sort;
          }, 500);
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadContacts();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery.set(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewContactDetails(contact: Contact) {
    // Open dialog to show full contact details
    const dialogRef = this.dialog.open(ContactDetailsDialogComponent, {
      width: '600px',
      data: contact,
    });
  }

  deleteContact(contact: Contact) {
    if (
      confirm(
        `Are you sure you want to delete the contact from ${contact.name}?`
      )
    ) {
      this.contactService.delete(contact._id).subscribe({
        next: () => {
          this.loadContacts(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
        },
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  truncateMessage(message: string, maxLength: number = 100): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }
}
