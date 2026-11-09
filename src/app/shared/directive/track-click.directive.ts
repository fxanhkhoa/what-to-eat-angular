import { Directive, HostListener, Input, inject } from '@angular/core';
import { WebsiteVisitService } from '@/app/service/website-visit.service';

@Directive({
  selector: '[appTrackClick]',
  standalone: true,
})
export class TrackClickDirective {
  private websiteVisitService = inject(WebsiteVisitService);

  @Input('appTrackClick') trackTarget = '';
  @Input() trackPath?: string;

  @HostListener('click')
  onClick(): void {
    const target = this.trackTarget || 'button_click';
    this.websiteVisitService.trackClick(target, this.trackPath).subscribe({
      error: () => {},
    });
  }
}

