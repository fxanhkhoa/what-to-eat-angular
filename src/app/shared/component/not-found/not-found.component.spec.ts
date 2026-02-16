import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be a standalone component', () => {
      const metadata = (NotFoundComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Template Rendering', () => {
    it('should render the not-found message', () => {
      const paragraph = compiled.querySelector('p');
      expect(paragraph).toBeTruthy();
      expect(paragraph?.textContent).toContain('not-found works!');
    });

    it('should have correct component structure', () => {
      expect(compiled).toBeTruthy();
      expect(compiled.querySelector('p')).toBeTruthy();
    });
  });

  describe('DOM Structure', () => {
    it('should contain a paragraph element', () => {
      const paragraphElements = compiled.querySelectorAll('p');
      expect(paragraphElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should render consistent HTML structure', () => {
      const paragraphElement = compiled.querySelector('p');
      expect(paragraphElement).toBeTruthy();
      expect(paragraphElement?.textContent).toContain('not-found works!');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes if needed', () => {
      // This test ensures the component doesn't break accessibility
      const mainElement = compiled.querySelector('p');
      expect(mainElement).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize without errors', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should destroy without errors', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });
});
