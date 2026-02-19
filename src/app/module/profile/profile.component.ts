import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  Renderer2,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { JWTTokenPayload } from '@/types/auth.type';
import { User, UpdateUserDto } from '@/types/user.type';
import { UserService } from '@/app/service/user.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { AuthService } from '@/app/service/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  payload?: JWTTokenPayload;
  user = signal<User | undefined>(undefined);
  isLoading = signal(false);
  isEditing = signal(false);

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [
      { value: '', disabled: true },
      [Validators.required, Validators.email],
    ],
    phone: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
    address: [''],
    dateOfBirth: [''],
  });

  avatarUrl = computed(() => {
    const userData = this.user();
    if (userData?.avatar) {
      return userData.avatar;
    }
    const name = userData?.name || this.payload?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=random&color=fff&size=256`;
  });

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'dark-theme');
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'dark-theme');
  }

  loadUserProfile(): void {
    this.isLoading.set(true);
    this.authService.getProfile().subscribe({
      next: (userData) => {
        if (!userData) {
          return;
        }
        this.user.set(userData!);
        this.populateForm(userData!);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.toastService.showError(
          $localize`Error`,
          $localize`Failed to load profile`,
          3000,
        );
        this.isLoading.set(false);
      },
    });
  }

  populateForm(userData: User): void {
    this.profileForm.patchValue({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || '',
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
    });
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      // Cancel edit - restore original values
      const userData = this.user();
      if (userData) {
        this.populateForm(userData);
      }
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.user()?._id) {
      this.toastService.showError(
        $localize`Error`,
        $localize`Please fill in all required fields`,
        3000,
      );
      return;
    }

    this.isLoading.set(true);
    const formValue = this.profileForm.getRawValue();

    const updateData: UpdateUserDto = {
      id: this.user()!._id,
      email: formValue.email,
      name: formValue.name,
      phone: formValue.phone || null,
      address: formValue.address || null,
      dateOfBirth: formValue.dateOfBirth
        ? new Date(formValue.dateOfBirth).toISOString()
        : null,
    };

    this.userService.update(updateData).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.isEditing.set(false);
        this.isLoading.set(false);
        this.toastService.showSuccess(
          $localize`Success`,
          $localize`Profile updated successfully`,
          3000,
        );
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.toastService.showError(
          $localize`Error`,
          $localize`Failed to update profile`,
          3000,
        );
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    window.history.back();
  }

  getAccountAge(): string {
    const userData = this.user();
    if (!userData?.createdAt) return 'N/A';

    const created = new Date(userData.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return $localize`${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return $localize`${months} months`;
    } else {
      const years = Math.floor(diffDays / 365);
      return $localize`${years} years`;
    }
  }

  getFormattedDate(date: string | null | undefined): string {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  }
}
