import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '@/app/service/user.service';
import { CreateUserDto, UpdateUserDto, User } from '@/types/user.type';
import { ToastService } from '@/app/shared/service/toast.service';
import { AuthorizationService } from '@/app/service/authorization.service';
import { RolePermission } from '@/types/role_permission.type';

@Component({
  selector: 'app-admin-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.scss'
})
export class AdminUserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private authorizationService = inject(AuthorizationService);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);

  form: FormGroup;
  isEdit = false;
  userId: string | null = null;
  loading = false;

  // Available roles fetched from authorization service
  availableRoles: string[] = [];
  rolesLoading = false;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      address: [''],
      dateOfBirth: [null],
      roleName: ['user', Validators.required],
    });
  }

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.userId;

    // Load available roles from authorization service
    this.loadRoles();

    if (this.isEdit && this.userId) {
      this.loadUser(this.userId);
    }
  }

  loadUser(id: string) {
    this.userService.findOne(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          email: user.email,
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
          roleName: user.roleName,
        });
      },
      error: (error) => {
        console.error('Error loading user', error);
        this.toastService.showError('Failed to load user', '', 3000);
        this.router.navigate(['/admin/user']);
      }
    });
  }

  loadRoles() {
    this.rolesLoading = true;
    this.authorizationService.findAll({}).subscribe({
      next: (response) => {
        // Extract unique role names from role permissions
        this.availableRoles = [...new Set(response.data.map(role => role.name))];
        this.rolesLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles', error);
        this.toastService.showError('Failed to load roles', '', 3000);
        // Fallback to default roles
        this.availableRoles = ['admin', 'user', 'moderator'];
        this.rolesLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.value;

      // Convert date to ISO string if present
      const dateOfBirth = formValue.dateOfBirth ? new Date(formValue.dateOfBirth).toISOString() : null;

      if (this.isEdit && this.userId) {
        const updateDto: UpdateUserDto = {
          id: this.userId,
          email: formValue.email,
          name: formValue.name,
          phone: formValue.phone,
          address: formValue.address,
          dateOfBirth: dateOfBirth,
        };

        this.userService.update(updateDto).subscribe({
          next: () => {
            this.toastService.showSuccess('User updated successfully', '', 3000);
            this.router.navigate(['/admin/user']);
          },
          error: (error) => {
            console.error('Error updating user', error);
            this.toastService.showError('Failed to update user', '', 3000);
            this.loading = false;
          }
        });
      } else {
        const createDto: CreateUserDto = {
          email: formValue.email,
          name: formValue.name,
          phone: formValue.phone,
          address: formValue.address,
          dateOfBirth: dateOfBirth,
        };

        this.userService.create(createDto).subscribe({
          next: () => {
            this.toastService.showSuccess('User created successfully', '', 3000);
            this.router.navigate(['/admin/user']);
          },
          error: (error) => {
            console.error('Error creating user', error);
            this.toastService.showError('Failed to create user', '', 3000);
            this.loading = false;
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/user']);
  }
}