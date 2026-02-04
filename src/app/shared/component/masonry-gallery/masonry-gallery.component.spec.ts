import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MasonryGalleryComponent } from './masonry-gallery.component';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <app-masonry-gallery [images]="images" [columns]="columns">
      <ng-template let-image let-index="index">
        <img [src]="image.src" [alt]="image.title" />
        <div class="title">{{ image.title }}</div>
      </ng-template>
    </app-masonry-gallery>
  `,
  imports: [MasonryGalleryComponent],
})
class TestHostComponent {
  images = [
    { src: 'image1.jpg', title: 'Image 1' },
    { src: 'image2.jpg', title: 'Image 2' },
    { src: 'image3.jpg', title: 'Image 3' },
  ];
  columns = 3;
}

describe('MasonryGalleryComponent', () => {
  let component: MasonryGalleryComponent;
  let fixture: ComponentFixture<MasonryGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasonryGalleryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasonryGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.images).toEqual([]);
    expect(component.columns).toBe(3);
  });

  it('should accept images input', () => {
    const testImages = [
      { src: 'test1.jpg', title: 'Test 1' },
      { src: 'test2.jpg', title: 'Test 2' },
    ];
    component.images = testImages;
    fixture.detectChanges();

    expect(component.images).toEqual(testImages);
  });

  it('should accept columns input', () => {
    component.columns = 4;
    fixture.detectChanges();

    expect(component.columns).toBe(4);
  });

  describe('Template rendering', () => {
    it('should render masonry container', () => {
      const container = fixture.debugElement.query(
        By.css('.masonry-container')
      );
      expect(container).toBeTruthy();
      expect(container.nativeElement.classList.contains('relative')).toBe(
        true
      );
      expect(container.nativeElement.classList.contains('w-full')).toBe(true);
    });

    it('should render masonry items for each image', () => {
      component.images = [
        { src: 'image1.jpg' },
        { src: 'image2.jpg' },
        { src: 'image3.jpg' },
      ];
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.masonry-item'));
      expect(items.length).toBe(3);
    });

    it('should apply correct classes to masonry items', () => {
      component.images = [{ src: 'image1.jpg' }];
      fixture.detectChanges();

      const item = fixture.debugElement.query(By.css('.masonry-item'));
      expect(item.nativeElement.classList.contains('transition-all')).toBe(
        true
      );
      expect(item.nativeElement.classList.contains('overflow-hidden')).toBe(
        true
      );
      expect(item.nativeElement.classList.contains('rounded-lg')).toBe(true);
      expect(item.nativeElement.classList.contains('shadow-md')).toBe(true);
    });

    it('should not render items when images array is empty', () => {
      component.images = [];
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.masonry-item'));
      expect(items.length).toBe(0);
    });
  });

  describe('getActualColumns', () => {
    it('should return 1 column for small screens (< 640px)', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(639);
      expect(component.getActualColumns()).toBe(1);
    });

    it('should return 2 columns for medium screens (640-767px)', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(700);
      expect(component.getActualColumns()).toBe(2);
    });

    it('should return 3 columns for large screens (768-1023px) when columns > 2', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(900);
      component.columns = 4;
      expect(component.getActualColumns()).toBe(3);
    });

    it('should return input columns for large screens when columns <= 2', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(900);
      component.columns = 2;
      expect(component.getActualColumns()).toBe(2);
    });

    it('should return input columns for extra large screens (>= 1024px)', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1200);
      component.columns = 5;
      expect(component.getActualColumns()).toBe(5);
    });
  });

  describe('arrangeItems', () => {
    beforeEach(() => {
      component.images = [
        { src: 'image1.jpg' },
        { src: 'image2.jpg' },
        { src: 'image3.jpg' },
      ];
      fixture.detectChanges();
    });

    it('should be called after view init', () => {
      spyOn(component, 'arrangeItems');
      component.ngAfterViewInit();
      expect(component.arrangeItems).toHaveBeenCalled();
    });

    it('should return early if no items exist', () => {
      component.images = [];
      fixture.detectChanges();

      expect(() => component.arrangeItems()).not.toThrow();
    });

    it('should set absolute positioning on items', () => {
      component.arrangeItems();
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.masonry-item');
      items.forEach((item: HTMLElement) => {
        expect(item.style.position).toBe('absolute');
      });
    });

    it('should set width on items', () => {
      component.arrangeItems();
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.masonry-item');
      items.forEach((item: HTMLElement) => {
        expect(item.style.width).toBeTruthy();
      });
    });

    it('should set left and top positions on items', () => {
      component.arrangeItems();
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.masonry-item');
      items.forEach((item: HTMLElement) => {
        expect(item.style.left).toBeTruthy();
        expect(item.style.top).toBeTruthy();
      });
    });

    it('should set container height', () => {
      component.arrangeItems();
      fixture.detectChanges();

      const container =
        fixture.nativeElement.querySelector('.masonry-container');
      expect(container.style.height).toBeTruthy();
    });
  });

  describe('Window resize handling', () => {
    it('should call arrangeItems on window resize', () => {
      spyOn(component, 'arrangeItems');
      component.onResize();
      expect(component.arrangeItems).toHaveBeenCalled();
    });

    it('should respond to window resize event', () => {
      spyOn(component, 'arrangeItems');
      window.dispatchEvent(new Event('resize'));
      expect(component.arrangeItems).toHaveBeenCalled();
    });
  });

  describe('ContentChild template projection', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should project custom template content', () => {
      const images = hostFixture.debugElement.queryAll(By.css('img'));
      expect(images.length).toBe(3);
      expect(images[0].nativeElement.src).toContain('image1.jpg');
    });

    it('should pass image data to template context', () => {
      const titles = hostFixture.debugElement.queryAll(By.css('.title'));
      expect(titles.length).toBe(3);
      expect(titles[0].nativeElement.textContent.trim()).toBe('Image 1');
      expect(titles[1].nativeElement.textContent.trim()).toBe('Image 2');
      expect(titles[2].nativeElement.textContent.trim()).toBe('Image 3');
    });

    it('should update when images change', () => {
      hostComponent.images = [
        { src: 'new1.jpg', title: 'New 1' },
        { src: 'new2.jpg', title: 'New 2' },
      ];
      hostFixture.detectChanges();

      const items = hostFixture.debugElement.queryAll(By.css('.masonry-item'));
      expect(items.length).toBe(2);
    });

    it('should update when columns change', () => {
      hostComponent.columns = 4;
      hostFixture.detectChanges();

      const galleryComponent = hostFixture.debugElement.query(
        By.directive(MasonryGalleryComponent)
      ).componentInstance;
      expect(galleryComponent.columns).toBe(4);
    });
  });
});
