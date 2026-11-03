import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VideoViewerComponent } from './video-viewer.component';
import { DomSanitizer } from '@angular/platform-browser';

const TEST_VIDEO_URL = 'https://www.youtube.com/embed/abc123';

describe('VideoViewerComponent', () => {
  let component: VideoViewerComponent;
  let fixture: ComponentFixture<VideoViewerComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<VideoViewerComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [VideoViewerComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useFactory: (sanitizer: DomSanitizer) =>
            sanitizer.bypassSecurityTrustResourceUrl(TEST_VIDEO_URL),
          deps: [DomSanitizer],
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject the video URL from MAT_DIALOG_DATA', () => {
    expect(component.data).toBeTruthy();
  });

  // ── template ──────────────────────────────────────────────────────────────

  it('should render an iframe', () => {
    const iframe: HTMLIFrameElement = fixture.nativeElement.querySelector('iframe');
    expect(iframe).not.toBeNull();
  });

  it('should render the title', () => {
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

  it('should render the iframe inside an aspect-video container', () => {
    const container: HTMLElement = fixture.nativeElement.querySelector('.aspect-video');
    expect(container).not.toBeNull();
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
  });

  it('should set allowfullscreen on the iframe', () => {
    const iframe: HTMLIFrameElement = fixture.nativeElement.querySelector('iframe');
    expect(iframe.hasAttribute('allowfullscreen')).toBeTrue();
  });
});

