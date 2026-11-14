import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { WebsiteVisitAnalytics } from '@/types/website_visit.type';

@Component({
  selector: 'app-tracking-kpi-cards',
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatCardModule, MatIconModule],
  templateUrl: './tracking-kpi-cards.component.html',
})
export class TrackingKpiCardsComponent {
  @Input() analytics: WebsiteVisitAnalytics | null = null;
}
