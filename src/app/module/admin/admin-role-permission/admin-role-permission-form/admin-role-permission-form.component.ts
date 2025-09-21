import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthorizationService } from '@/app/service/authorization.service';
import { Permissions } from '@/constant/permission.constant';
import { RolePermission, CreateRolePermissionDto, UpdateRolePermissionDto } from '@/types/role_permission.type';
import { ToastService } from '@/app/shared/service/toast.service';

@Component({
  selector: 'app-admin-role-permission-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    DragDropModule,
  ],
  templateUrl: './admin-role-permission-form.component.html',
  styleUrl: './admin-role-permission-form.component.scss'
})
export class AdminRolePermissionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authorizationService = inject(AuthorizationService);
  private toastService = inject(ToastService);

  form: FormGroup;
  isEdit = false;
  rolePermissionId: string | null = null;
  loading = false;

  // Available permissions from constants
  availablePermissions: string[] = Object.values(Permissions);

  // Selected permissions for the role
  selectedPermissions: string[] = [];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
  }

  ngOnInit() {
    this.rolePermissionId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.rolePermissionId;

    if (this.isEdit && this.rolePermissionId) {
      this.loadRolePermission(this.rolePermissionId);
    }

    // Filter out already selected permissions from available list
    this.updateAvailablePermissions();
  }

  loadRolePermission(id: string) {
    this.authorizationService.findOne(id).subscribe({
      next: (rolePermission) => {
        this.form.patchValue({
          name: rolePermission.name,
          description: rolePermission.description || '',
        });
        this.selectedPermissions = rolePermission.permission || [];
        this.updateAvailablePermissions();
      },
      error: (error) => {
        console.error('Error loading role permission', error);
        this.toastService.showError('Failed to load role permission', '', 3000);
        this.router.navigate(['/admin/role-permission']);
      }
    });
  }

  updateAvailablePermissions() {
    this.availablePermissions = Object.values(Permissions).filter(
      perm => !this.selectedPermissions.includes(perm)
    );
  }

  onDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      // Reorder within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between lists
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.updateAvailablePermissions();
    }
  }

  removePermission(permission: string) {
    const index = this.selectedPermissions.indexOf(permission);
    if (index > -1) {
      this.selectedPermissions.splice(index, 1);
      this.updateAvailablePermissions();
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.value;

      if (this.isEdit && this.rolePermissionId) {
        const updateDto: UpdateRolePermissionDto = {
          id: this.rolePermissionId,
          name: formValue.name,
          permission: this.selectedPermissions,
          description: formValue.description,
        };

        this.authorizationService.update(this.rolePermissionId, updateDto).subscribe({
          next: () => {
            this.toastService.showSuccess('Role permission updated successfully', '', 3000);
            this.router.navigate(['/admin/role-permission']);
          },
          error: (error) => {
            console.error('Error updating role permission', error);
            this.toastService.showError('Failed to update role permission', '', 3000);
            this.loading = false;
          }
        });
      } else {
        const createDto: CreateRolePermissionDto = {
          name: formValue.name,
          permission: this.selectedPermissions,
          description: formValue.description,
        };

        this.authorizationService.create(createDto).subscribe({
          next: () => {
            this.toastService.showSuccess('Role permission created successfully', '', 3000);
            this.router.navigate(['/admin/role-permission']);
          },
          error: (error) => {
            console.error('Error creating role permission', error);
            this.toastService.showError('Failed to create role permission', '', 3000);
            this.loading = false;
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/role-permission']);
  }

  trackByPermission(index: number, permission: string): string {
    return permission;
  }
}
