import {
  Component,
  inject,
  OnInit,
  LOCALE_ID,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { CreateUserDishCollectionDto, UpdateUserDishCollectionDto, UserDishCollection } from '@/types/user-dish-collection.type';
import { ToastService } from '@/app/shared/service/toast.service';
import { AuthService } from '@/app/service/auth.service';
import { DishService } from '@/app/service/dish.service';
import { User } from '@/types/user.type';
import { Dish } from '@/types/dish.type';
import { take, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Subject } from 'rxjs';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DishDetailDialogComponent } from '@/app/shared/component/dish-detail-dialog/dish-detail-dialog.component';

@Component({
  selector: 'app-user-dish-list-create',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ReactiveFormsModule,
    MultiLanguagePipe,
  ],
  templateUrl: './user-dish-list-create.component.html',
  styleUrl: './user-dish-list-create.component.scss',
})
export class UserDishListCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private collectionService = inject(UserDishCollectionService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private dishService = inject(DishService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  localeId = inject(LOCALE_ID);
  private platform = inject(PLATFORM_ID);

  collectionId: string | null = null;
  existingCollection: UserDishCollection | null = null;
  collectionCount: number = 0;

  collectionForm!: FormGroup;
  profile: User | null = null;
  loading = false;

  // Dish selection
  searchQuery = '';
  searchSubject = new Subject<string>();
  searchResults: Dish[] = [];
  selectedDishes: Dish[] = [];
  loadingDishes = false;

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
    // Always initialize form first to avoid SSR issues
    this.initForm();
    
    if (isPlatformServer(this.platform)) {
      return;
    }
    
    this.authService
      .getProfile()
      .pipe(take(1))
      .subscribe((profile) => {
        this.profile = profile;
        
        // Get collection ID from route if editing
        this.collectionId = this.route.snapshot.paramMap.get('id');
        
        if (this.collectionId) {
          this.loadCollectionById(this.collectionId);
        } else {
          // Get collection count for sort order when creating
          this.loadCollectionCount();
        }
      });
      
    this.setupDishSearch();
  }

  loadCollectionCount(): void {
    this.collectionService.findAll({ userId: this.profile?._id || '' })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.collectionCount = response.data?.length || 0;
        },
        error: () => {
          this.collectionCount = 0;
        }
      });
  }

  loadCollectionById(id: string): void {
    this.loading = true;
    this.collectionService.findById(id)
      .pipe(take(1))
      .subscribe({
        next: (collection) => {
          this.existingCollection = collection;
          this.loadExistingCollection(collection);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.showError('Error', 'Failed to load collection');
          this.router.navigate(['/my-dishes']);
        }
      });
  }

  loadExistingCollection(collection: UserDishCollection): void {
    // Populate form with existing data
    this.collectionForm.patchValue({
      name: collection.name,
      description: collection.description || '',
      occasion: collection.occasion || '',
      eventDate: collection.eventDate ? new Date(collection.eventDate) : new Date(),
      icon: collection.icon || 'cake',
      color: collection.color || '#3b82f6',
      isPublic: collection.isPublic || false,
      tags: collection.tags || [],
    });

    // Load dishes from slugs
    if (collection.dishSlugs && collection.dishSlugs.length > 0) {
      this.loadingDishes = true;
      collection.dishSlugs.forEach((slug, index) => {
        this.dishService.findBySlug(slug).subscribe({
          next: (dish) => {
            if (!this.selectedDishes.find(d => d.slug === dish.slug)) {
              this.selectedDishes = [...this.selectedDishes, dish];
            }
            // Stop loading when all dishes are loaded
            if (index === collection.dishSlugs.length - 1) {
              this.loadingDishes = false;
            }
          },
          error: () => {
            if (index === collection.dishSlugs.length - 1) {
              this.loadingDishes = false;
            }
          }
        });
      });
    }
  }

  isEditMode(): boolean {
    return this.collectionId !== null && this.existingCollection !== null;
  }

  setupDishSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.trim().length < 2) {
            this.searchResults = [];
            this.loadingDishes = false;
            return [];
          }
          this.loadingDishes = true;
          return this.dishService.findWithScore({
            keyword: query,
            page: 1,
            limit: 12,
          });
        }),
      )
      .subscribe({
        next: (response) => {
          this.searchResults = response.data || [];
          this.loadingDishes = false;
        },
        error: () => {
          this.loadingDishes = false;
          this.searchResults = [];
        },
      });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  addDish(dish: Dish): void {
    if (!this.selectedDishes.find((d) => d.slug === dish.slug)) {
      this.selectedDishes = [...this.selectedDishes, dish];
    }
  }

  removeDish(slug: string): void {
    this.selectedDishes = this.selectedDishes.filter((d) => d.slug !== slug);
  }

  isDishSelected(slug: string): boolean {
    return this.selectedDishes.some((d) => d.slug === slug);
  }

  openDishDetail(dish: Dish, event: Event): void {
    event.stopPropagation();
    this.dialog.open(DishDetailDialogComponent, {
      data: dish,
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'dish-detail-dialog-panel',
      autoFocus: false,
    });
  }

  initForm(): void {
    const today = new Date();
    this.collectionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      occasion: [''],
      eventDate: [today],
      icon: ['cake'],
      color: ['#3b82f6'],
      isPublic: [false],
      tags: [[]],
    });
  }

  createCollection(): void {
    if (this.collectionForm.invalid) {
      return;
    }

    if (!this.profile) {
      this.toastService.showError(
        'Error',
        'Please login to create collections',
        1500,
      );
      return;
    }

    this.loading = true;
    const formValue = this.collectionForm.value;

    if (this.isEditMode() && this.existingCollection) {
      // Update existing collection
      const dto: UpdateUserDishCollectionDto = {
        _id: this.existingCollection._id,
        userId: this.profile._id || '',
        name: formValue.name,
        description: formValue.description || undefined,
        occasion: formValue.occasion || undefined,
        eventDate: formValue.eventDate
          ? new Date(formValue.eventDate).toISOString()
          : undefined,
        dishSlugs: this.selectedDishes.map((d) => d.slug),
        tags: formValue.tags || [],
        isPublic: formValue.isPublic || false,
        color: formValue.color || '#3b82f6',
        icon: formValue.icon || 'cake',
        sortOrder: this.existingCollection.sortOrder,
      };

      this.collectionService.update(dto).subscribe({
        next: () => {
          this.toastService.showSuccess(
            'Success',
            'Collection updated successfully!',
            1500,
          );
          this.router.navigate(['/my-dishes']);
        },
        error: () => {
          this.loading = false;
          this.toastService.showError('Failed to update collection');
        },
      });
    } else {
      const dto: CreateUserDishCollectionDto = {
        userId: this.profile._id || '',
        name: formValue.name,
        description: formValue.description || undefined,
        occasion: formValue.occasion || undefined,
        eventDate: formValue.eventDate
          ? new Date(formValue.eventDate).toISOString()
          : undefined,
        dishSlugs: this.selectedDishes.map((d) => d.slug),
        tags: formValue.tags || [],
        isPublic: formValue.isPublic || false,
        color: formValue.color || '#3b82f6',
        icon: formValue.icon || 'cake',
        sortOrder: this.collectionCount,
      };

      this.collectionService.create(dto).subscribe({
        next: () => {
          this.toastService.showSuccess(
            'Success',
            'Collection created successfully!',
            1500,
          );
          this.router.navigate(['/my-dishes']);
        },
        error: () => {
          this.loading = false;
          this.toastService.showError('Failed to create collection');
        },
      });
    }
  }

  resetForm(): void {
    const today = new Date();
    this.collectionForm.reset({
      icon: 'cake',
      color: '#3b82f6',
      isPublic: false,
      eventDate: today,
    });
    this.selectedDishes = [];
    this.searchQuery = '';
    this.searchResults = [];
  }

  cancel(): void {
    this.router.navigate(['/my-dishes']);
  }
}
