import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { TypingIndicatorComponent } from './typing-indicator.component';

describe('TypingIndicatorComponent', () => {
  let component: TypingIndicatorComponent;
  let fixture: ComponentFixture<TypingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypingIndicatorComponent],
    })
      .overrideComponent(TypingIndicatorComponent, {
        set: { imports: [CommonModule] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TypingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---- Creation ----------------------------------------------------------

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  // ---- typingText computed -----------------------------------------------

  describe('typingText()', () => {
    it('should return empty string when typingUserNames is empty', () => {
      component.typingUserNames = [];
      fixture.detectChanges();
      expect(component.typingText()).toBe('');
    });

    it('should return "X is typing..." for one user', () => {
      component.typingUserNames = ['Alice'];
      fixture.detectChanges();
      expect(component.typingText()).toContain('Alice');
      expect(component.typingText()).toContain('typing');
    });

    it('should include both names for two users', () => {
      component.typingUserNames = ['Alice', 'Bob'];
      fixture.detectChanges();
      const text = component.typingText();
      expect(text).toContain('Alice');
      expect(text).toContain('Bob');
      expect(text).toContain('typing');
    });

    it('should include count in text for three or more users', () => {
      component.typingUserNames = ['Alice', 'Bob', 'Charlie'];
      fixture.detectChanges();
      expect(component.typingText()).toContain('3');
    });

    it('should include count for four users', () => {
      component.typingUserNames = ['A', 'B', 'C', 'D'];
      fixture.detectChanges();
      expect(component.typingText()).toContain('4');
    });

    it('should update reactively when typingUserNames changes', () => {
      component.typingUserNames = ['Alice'];
      fixture.detectChanges();
      expect(component.typingText()).toContain('Alice');

      component.typingUserNames = ['Bob'];
      fixture.detectChanges();
      expect(component.typingText()).toContain('Bob');
    });

    it('should go back to empty string when names cleared', () => {
      component.typingUserNames = ['Alice'];
      fixture.detectChanges();
      component.typingUserNames = [];
      fixture.detectChanges();
      expect(component.typingText()).toBe('');
    });
  });

  // ---- @Input setter ------------------------------------------------------

  describe('@Input typingUserNames setter', () => {
    it('should update the internal signal via setter', () => {
      component.typingUserNames = ['Test User'];
      expect((component as any)._typingUserNames()).toEqual(['Test User']);
    });

    it('should replace previous value entirely', () => {
      component.typingUserNames = ['First'];
      component.typingUserNames = ['Second', 'Third'];
      expect((component as any)._typingUserNames()).toEqual(['Second', 'Third']);
    });
  });

  // ---- Template: hidden when no users ------------------------------------

  describe('template — hidden when no typing users', () => {
    it('should not render the container div when typingUserNames is empty', () => {
      component.typingUserNames = [];
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.flex.items-center'));
      expect(container).toBeNull();
    });

    it('should not render bouncing dots when typingUserNames is empty', () => {
      component.typingUserNames = [];
      fixture.detectChanges();
      const dots = fixture.debugElement.queryAll(By.css('.animate-bounce'));
      expect(dots.length).toBe(0);
    });
  });

  // ---- Template: visible when typing -------------------------------------

  describe('template — visible when typing', () => {
    beforeEach(() => {
      component.typingUserNames = ['Alice'];
      fixture.detectChanges();
    });

    it('should render the outer container when there are typing users', () => {
      const container = fixture.debugElement.query(By.css('.flex.items-center'));
      expect(container).not.toBeNull();
    });

    it('should render three bouncing dots', () => {
      const dots = fixture.debugElement.queryAll(By.css('.animate-bounce'));
      expect(dots.length).toBe(3);
    });

    it('should display the typingText in the template', () => {
      const textEl = fixture.debugElement.query(By.css('.text-xs.text-gray-500'));
      expect(textEl).not.toBeNull();
      expect(textEl.nativeElement.textContent).toContain('Alice');
    });

    it('should hide the container when names are cleared after being set', () => {
      component.typingUserNames = [];
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.flex.items-center'));
      expect(container).toBeNull();
    });
  });

  // ---- Template: two users -----------------------------------------------

  describe('template — two typing users', () => {
    it('should display text containing both names', () => {
      component.typingUserNames = ['Alice', 'Bob'];
      fixture.detectChanges();
      const textEl = fixture.debugElement.query(By.css('.text-xs.text-gray-500'));
      expect(textEl.nativeElement.textContent).toContain('Alice');
      expect(textEl.nativeElement.textContent).toContain('Bob');
    });
  });

  // ---- Template: many users ----------------------------------------------

  describe('template — many typing users', () => {
    it('should display text containing the count', () => {
      component.typingUserNames = ['A', 'B', 'C'];
      fixture.detectChanges();
      const textEl = fixture.debugElement.query(By.css('.text-xs.text-gray-500'));
      expect(textEl.nativeElement.textContent).toContain('3');
    });
  });
});
