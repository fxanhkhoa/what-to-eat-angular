import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { UserDishCollection } from '@/types/user-dish-collection.type';
import { ToastService } from '@/app/shared/service/toast.service';
import { AuthService } from '@/app/service/auth.service';
import { take } from 'rxjs';
import { User } from '@/types/user.type';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-user-dish-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    RouterModule,
    MatDividerModule,
  ],
  templateUrl: './user-dish-list.component.html',
  styleUrl: './user-dish-list.component.scss',
})
export class UserDishListComponent implements OnInit {
  private collectionService = inject(UserDishCollectionService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private platform = inject(PLATFORM_ID);
  private router = inject(Router);

  collections = signal<UserDishCollection[]>([]);
  loading = signal(false);
  profile: User | null = null;

  ngOnInit(): void {
    if (isPlatformServer(this.platform)) {
      return;
    }
    this.authService
      .getProfile()
      .pipe(take(1))
      .subscribe((profile) => {
        this.profile = profile;
      });
    this.loadCollections();
  }

  loadCollections(): void {
    this.loading.set(true);

    this.collectionService
      .findAll({ userId: this.profile?._id || '' })
      .subscribe({
        next: (response) => {
          if (!response.data) {
            this.loading.set(false);
            return;
          }
          this.collections.set(response.data);
          this.loading.set(false);
        },
        error: (e) => {
          console.error(e);
          this.loading.set(false);
          this.toastService.showError(
            'Error',
            'Failed to load collections 1',
            1500,
          );
        },
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/my-dishes/create']);
  }

  navigateToEdit(collectionId: string): void {
    this.router.navigate(['/my-dishes/edit', collectionId]);
  }

  deleteCollection(id: string): void {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    this.collectionService.delete(id).subscribe({
      next: () => {
        this.collections.update((cols) => cols.filter((c) => c._id !== id));
        this.toastService.showSuccess(
          'Success',
          'Collection deleted successfully',
        );
      },
      error: () => {
        this.toastService.showError(
          'Error',
          'Failed to delete collection',
          1500,
        );
      },
    });
  }

  duplicateCollection(collection: UserDishCollection): void {
    this.collectionService
      .duplicate({
        userId: this.profile?._id || '',
        collectionId: collection._id,
        newName: `${collection.name} (Copy)`,
        copyPublic: false,
      })
      .subscribe({
        next: (newCollection) => {
          this.collections.update((cols) => [newCollection, ...cols]);
          this.toastService.showSuccess(
            'Success',
            'Collection duplicated successfully',
          );
        },
        error: () => {
          this.toastService.showError(
            'Error',
            'Failed to duplicate collection',
            1500,
          );
        },
      });
  }
}
