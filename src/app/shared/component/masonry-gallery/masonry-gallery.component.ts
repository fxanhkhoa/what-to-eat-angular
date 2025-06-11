import {
  CommonModule,
  isPlatformBrowser,
  isPlatformServer,
} from '@angular/common';
import {
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  inject,
  Input,
  PLATFORM_ID,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'app-masonry-gallery',
  imports: [CommonModule],
  templateUrl: './masonry-gallery.component.html',
  styleUrl: './masonry-gallery.component.scss',
})
export class MasonryGalleryComponent {
  @Input() images: { src: string; title?: string }[] = [];
  @Input() columns: number = 3; // Default number of columns
  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<any>;

  private el = inject(ElementRef);
  private platformId = inject<string>(PLATFORM_ID);

  ngAfterViewInit() {
    this.arrangeItems();
  }

  @HostListener('window:resize')
  onResize() {
    this.arrangeItems();
  }

  arrangeItems() {
    // Get all gallery items
    const items = this.el.nativeElement.querySelectorAll('.masonry-item');
    if (!items.length) return;

    // Reset positions
    items.forEach((item: HTMLElement) => {
      item.style.removeProperty('top');
      item.style.removeProperty('left');
    });

    // Calculate responsive columns based on screen size
    // (Tailwind's breakpoints are handled in the template)

    // Calculate item width and gap
    const container = this.el.nativeElement.querySelector('.masonry-container');
    const containerWidth = container.offsetWidth;
    const gap = 16; // 1rem in pixels (matches Tailwind's gap-4)
    const actualColumns = this.getActualColumns();
    const itemWidth =
      (containerWidth - gap * (actualColumns - 1)) / actualColumns;

    // Set width for each item
    items.forEach((item: HTMLElement) => {
      item.style.width = `${itemWidth}px`;
    });

    // Calculate and set positions
    const columnsHeights = Array(actualColumns).fill(0);

    items.forEach((item: HTMLElement) => {
      // Find the shortest column
      const shortestColumn = columnsHeights.indexOf(
        Math.min(...columnsHeights)
      );

      // Calculate position
      const leftPos = shortestColumn * (itemWidth + gap);
      const topPos = columnsHeights[shortestColumn];

      // Position the item
      item.style.position = 'absolute';
      item.style.left = `${leftPos}px`;
      item.style.top = `${topPos}px`;

      // Update column height
      columnsHeights[shortestColumn] += item.offsetHeight + gap;
    });

    // Set container height
    const containerHeight = Math.max(...columnsHeights) - gap;
    container.style.height = `${containerHeight}px`;
  }

  getActualColumns(): number {
    // Determine number of columns based on current screen width
    // These values should match the responsive classes in the template
    if (isPlatformServer(this.platformId)) {
      return 3;
    }

    if (window.innerWidth < 640) return 1; // sm
    if (window.innerWidth < 768) return 2; // md
    if (window.innerWidth < 1024) return this.columns > 2 ? 3 : this.columns; // lg
    return this.columns;
  }
}
