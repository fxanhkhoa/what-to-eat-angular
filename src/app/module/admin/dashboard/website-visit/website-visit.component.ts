import { Component, inject, OnInit } from '@angular/core';
import { WebsiteVisitService } from '@/app/service/website-visit.service';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-website-visit',
  standalone: true,
  imports: [MatCardModule, DecimalPipe, CommonModule],
  templateUrl: './website-visit.component.html',
  styleUrls: ['./website-visit.component.scss'],
})
export class WebsiteVisitComponent implements OnInit {
  private websiteVisitService = inject(WebsiteVisitService);
  visitCount: number | null = null;

  ngOnInit(): void {
    this.websiteVisitService.getVisitCount().subscribe((res) => {
      this.visitCount = res.count;
    });
  }
}
