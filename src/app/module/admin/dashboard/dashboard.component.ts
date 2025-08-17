import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { AuthorizationService } from '@/app/service/authorization.service';
import { RolePermission } from '@/types/auth.type';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { DishService } from '@/app/service/dish.service';
import { IngredientService } from '@/app/service/ingredient.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTableModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent implements OnInit {
  roles: RolePermission[] = [];
  loading = false;
  error: string | null = null;

  dishCount: number | null = null;
  ingredientCount: number | null = null;

  constructor(
    private authorizationService: AuthorizationService,
    private dishService: DishService,
    private ingredientService: IngredientService
  ) {}

  ngOnInit(): void {
    this.fetchRoles();
    this.fetchAnalytics();
  }

  fetchRoles() {
    this.loading = true;
    this.error = null;
    // Example: fetch a list of roles (replace with your actual API call if needed)
    this.authorizationService.findByName('ADMIN').subscribe({
      next: (role) => {
        this.roles = [role]; // For demo, just show ADMIN role. Replace with all roles if you have an endpoint.
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load roles';
        this.loading = false;
      },
    });
  }

  fetchAnalytics() {
    this.dishService.findAll({}).subscribe({
      next: (res) => {
        this.dishCount = res.count;
      },
      error: () => {
        this.dishCount = null;
      }
    });
    this.ingredientService.findAll({}).subscribe({
      next: (res) => {
        this.ingredientCount = res.count;
      },
      error: () => {
        this.ingredientCount = null;
      }
    });
  }
}
