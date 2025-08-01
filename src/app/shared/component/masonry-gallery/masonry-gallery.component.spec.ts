import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasonryGalleryComponent } from './masonry-gallery.component';

describe('MasonryGalleryComponent', () => {
  let component: MasonryGalleryComponent;
  let fixture: ComponentFixture<MasonryGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasonryGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasonryGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
