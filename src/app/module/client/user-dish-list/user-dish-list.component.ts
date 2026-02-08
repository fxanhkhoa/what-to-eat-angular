import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import {
  UserDishCollection,
  CreateUserDishCollectionDto,
} from '@/types/user-dish-collection.type';
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
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatMenuModule,
    RouterModule,
    ReactiveFormsModule,
    MatDividerModule,
  ],
  templateUrl: './user-dish-list.component.html',
  styleUrl: './user-dish-list.component.scss',
})
export class UserDishListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private collectionService = inject(UserDishCollectionService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  collections = signal<UserDishCollection[]>([]);
  loading = signal(false);
  showCreateForm = signal(false);
  collectionForm!: FormGroup;
  profile: User | null = null;

  availableIcons = [
    { name: 'cake', label: 'Birthday' },
    { name: 'favorite', label: 'Favorite' },
    { name: 'celebration', label: 'Party' },
    { name: 'restaurant', label: 'Restaurant' },
    { name: 'local_bar', label: 'Drinks' },
    { name: 'restaurant_menu', label: 'Menu' },
    { name: 'dinner_dining', label: 'Dinner' },
    { name: 'brunch_dining', label: 'Brunch' },
    { name: 'fastfood', label: 'Fast Food' },
    { name: 'ramen_dining', label: 'Ramen' },
    { name: 'set_meal', label: 'Set Meal' },
    { name: 'lunch_dining', label: 'Lunch' },
  ];

  availableColors = [
    { value: '#ef4444', name: 'Red' },
    { value: '#f97316', name: 'Orange' },
    { value: '#eab308', name: 'Yellow' },
    { value: '#22c55e', name: 'Green' },
    { value: '#3b82f6', name: 'Blue' },
    { value: '#8b5cf6', name: 'Purple' },
    { value: '#ec4899', name: 'Pink' },
    { value: '#6366f1', name: 'Indigo' },
  ];

  occasions = [
    'birthday',
    'anniversary',
    'holiday',
    'party',
    'wedding',
    'picnic',
    'date night',
    'family gathering',
    'other',
  ];

  ngOnInit(): void {
    this.authService
      .getProfile()
      .pipe(take(1))
      .subscribe((profile) => {
        this.profile = profile;
      });
    this.initForm();
    this.loadCollections();
  }

  initForm(): void {
    this.collectionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      occasion: [''],
      eventDate: [''],
      icon: ['cake'],
      color: ['#3b82f6'],
      isPublic: [false],
      tags: [[]],
    });
  }

  loadCollections(): void {
    this.loading.set(true);

    this.collectionService
      .findAll({ userId: this.profile?._id || '' })
      .subscribe({
        next: (response) => {
          this.collections.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toastService.showError(
            'Error',
            'Failed to load collections',
            1500,
          );
        },
      });
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((val) => !val);
    if (!this.showCreateForm()) {
      this.collectionForm.reset({
        icon: 'cake',
        color: '#3b82f6',
        isPublic: false,
      });
    }
  }

  createCollection(): void {
    if (this.collectionForm.invalid) {
      return;
    }

    const payload = this.authService.getProfile();
    if (!payload) {
      this.toastService.showError(
        'Error',
        'Please login to create collections',
        1500,
      );
      return;
    }

    this.loading.set(true);
    const formValue = this.collectionForm.value;

    const dto: CreateUserDishCollectionDto = {
      userId: this.profile?._id || '',
      name: formValue.name,
      description: formValue.description || undefined,
      occasion: formValue.occasion || undefined,
      eventDate: formValue.eventDate
        ? new Date(formValue.eventDate).toISOString()
        : undefined,
      dishSlugs: [],
      tags: formValue.tags || [],
      isPublic: formValue.isPublic || false,
      color: formValue.color || '#3b82f6',
      icon: formValue.icon || 'cake',
      sortOrder: this.collections().length,
    };

    this.collectionService.create(dto).subscribe({
      next: (collection) => {
        this.collections.update((cols) => [collection, ...cols]);
        this.toastService.showSuccess(
          'Success',
          'Collection created successfully!',
          1500,
        );
        this.toggleCreateForm();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.showError('Failed to create collection');
      },
    });
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
        this.toastService.showError('Error', 'Failed to delete collection');
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
          );
        },
      });
  }
}
