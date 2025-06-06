import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-masonry-gallery',
  imports: [CommonModule],
  templateUrl: './masonry-gallery.component.html',
  styleUrl: './masonry-gallery.component.scss',
})
export class MasonryGalleryComponent {
  @Input() items: any[] = [];
  @Input() columns: number = 3;
  @Input() gap: number = 16;
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
}
