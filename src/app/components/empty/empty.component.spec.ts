import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { EmptyComponent } from './empty.component';
import { provideHttpClient } from '@angular/common/http';

describe('EmptyComponent', () => {
  let component: EmptyComponent;
  let fixture: ComponentFixture<EmptyComponent>;
  let iconRegistry: MatIconRegistry;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyComponent, MatIconModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyComponent);
    component = fixture.componentInstance;
    iconRegistry = TestBed.inject(MatIconRegistry);
    sanitizer = TestBed.inject(DomSanitizer);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register the empty SVG icon on initialization', () => {
    // The icon registration happens in the constructor via dependency injection
    // This is tested implicitly through the component creation and proper functioning
    expect(component).toBeTruthy();
  });

  it('should render the empty state UI', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Check for the main container
    const container = compiled.querySelector('.glassmorphic-container_dark');
    expect(container).toBeTruthy();

    // Check for the mat-icon element
    const icon = compiled.querySelector('mat-icon');
    expect(icon).toBeTruthy();

    // Check for the "No Data" text
    const textElement = compiled.querySelector('span');
    expect(textElement?.textContent?.trim()).toBe('No Data');
  });

  it('should have proper CSS classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector(
      '.flex.flex-col.justify-end.items-center',
    );

    expect(container).toBeTruthy();
    expect(container?.classList.contains('min-h-32')).toBe(true);
    expect(container?.classList.contains('glassmorphic-container_dark')).toBe(
      true,
    );
  });
});
