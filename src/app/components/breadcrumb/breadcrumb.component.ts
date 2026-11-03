import { BreadcrumbService } from '@/app/service/breadcrumb.service';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, MatButtonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: Array<{ label: string; url: string }> = [];
  subscription: Subscription = new Subscription();

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    // Set initial breadcrumbs
    this.breadcrumbs = this.breadcrumbService.breadcrumbs;

    // Subscribe to breadcrumb changes
    this.subscription = this.breadcrumbService.breadcrumbs$.subscribe(
      (breadcrumbs) => {
        this.breadcrumbs = breadcrumbs;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
