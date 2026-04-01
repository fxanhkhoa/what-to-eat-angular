import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageViewerComponent } from './image-viewer.component';

const TEST_IMAGE_URL = 'https://example.com/photo.jpg';

function createDialogRefSpy() {
  return jasmine.createSpyObj('MatDialogRef', ['close']);
}

describe('ImageViewerComponent', () => {
  let component: ImageViewerComponent;
  let fixture: ComponentFixture<ImageViewerComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ImageViewerComponent>>;

  beforeEach(async () => {
    dialogRefSpy = createDialogRefSpy();

    await TestBed.configureTestingModule({
      imports: [ImageViewerComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: TEST_IMAGE_URL },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject the image URL from MAT_DIALOG_DATA', () => {
    expect(component.data).toBe(TEST_IMAGE_URL);
  });

  // ── template ──────────────────────────────────────────────────────────────

  it('should render the image with the injected src', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.src).toBe(TEST_IMAGE_URL);
  });

  it('should render the "Image Preview" title', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-title]');
    expect(title).not.toBeNull();
    expect(title.textContent?.trim()).toBe('Image Preview');
  });

  it('should render a Close button in the dialog actions', () => {
    const actions: HTMLElement = fixture.nativeElement.querySelector('mat-dialog-actions');
    expect(actions).not.toBeNull();
    expect(actions.textContent).toContain('Close');
  });

  it('should render an icon close button in the header', () => {
    const iconBtn = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(iconBtn).not.toBeNull();
  });
});
