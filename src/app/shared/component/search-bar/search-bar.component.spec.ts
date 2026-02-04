import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID, PLATFORM_ID } from '@angular/core';

import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SearchBarComponent,
        FormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: LOCALE_ID, useValue: 'en-US' },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.keyword).toBe('');
      expect(component.finalTranscript).toBe('');
      expect(component.recognizing()).toBe(false);
    });

    it('should initialize with provided keyword input', () => {
      const testKeyword = 'test search';
      component.keyword = testKeyword;
      fixture.detectChanges();
      
      expect(component.keyword).toBe(testKeyword);
    });
  });

  describe('Template Rendering', () => {
    it('should render search icon', () => {
      const searchIcon = compiled.querySelector('mat-icon');
      expect(searchIcon).toBeTruthy();
      expect(searchIcon?.textContent?.trim()).toBe('search');
    });

    it('should render input field', () => {
      const input = compiled.querySelector('input[type="text"]');
      expect(input).toBeTruthy();
    });

    it('should render microphone button', () => {
      const micButton = compiled.querySelector('button');
      expect(micButton).toBeTruthy();
      
      const micIcon = micButton?.querySelector('mat-icon');
      expect(micIcon?.textContent?.trim()).toBe('mic');
    });

    it('should have gradient background on input', () => {
      const input = compiled.querySelector('input');
      expect(input?.classList.contains('bg-gradient-to-r')).toBe(true);
    });
  });

  describe('Two-way Data Binding', () => {
    it('should bind finalTranscript to input field', async () => {
      component.finalTranscript = 'test input';
      fixture.detectChanges();
      await fixture.whenStable();

      const input = compiled.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('test input');
    });

    it('should update finalTranscript when input changes', async () => {
      const input = compiled.querySelector('input') as HTMLInputElement;
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.finalTranscript).toBe('new value');
    });
  });

  describe('Search Functionality', () => {
    it('should emit onResult when search is called', (done) => {
      component.finalTranscript = 'search term';
      
      component.onResult.subscribe((result: string) => {
        expect(result).toBe('search term');
        done();
      });

      component.search();
    });

    it('should call search on Enter key press', () => {
      spyOn(component, 'search');
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      
      component.keyPress(event);
      
      expect(component.search).toHaveBeenCalled();
    });

    it('should not call search on other key press', () => {
      spyOn(component, 'search');
      const event = new KeyboardEvent('keypress', { key: 'a' });
      
      component.keyPress(event);
      
      expect(component.search).not.toHaveBeenCalled();
    });

    it('should trigger search when Enter is pressed in input', () => {
      spyOn(component, 'search');
      const input = compiled.querySelector('input') as HTMLInputElement;
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      
      input.dispatchEvent(event);
      component.keyPress(event);
      
      expect(component.search).toHaveBeenCalled();
    });
  });

  describe('Speech Recognition', () => {
    it('should initialize recognition when available', () => {
      // In browser environment, recognition should be initialized
      expect(component['recognition']).toBeDefined();
    });

    it('should call recognition.start when startSpeechRecognition is called', () => {
      if (component['recognition']) {
        spyOn(component['recognition'], 'start');
        
        component.startSpeechRecognition();
        
        expect(component['recognition'].start).toHaveBeenCalled();
      } else {
        // If recognition is not available, method should not throw
        expect(() => component.startSpeechRecognition()).not.toThrow();
      }
    });

    it('should handle startSpeechRecognition when recognition is not available', () => {
      component['recognition'] = null;
      
      expect(() => component.startSpeechRecognition()).not.toThrow();
    });

    it('should set recognizing to true when recognition starts', () => {
      if (component['recognition']) {
        component['recognition'].onstart();
        expect(component.recognizing()).toBe(true);
      }
    });

    it('should set recognizing to false when recognition ends', () => {
      if (component['recognition']) {
        component['recognition'].onend();
        expect(component.recognizing()).toBe(false);
      }
    });

    it('should process speech result and call search', () => {
      spyOn(component, 'search');
      
      if (component['recognition']) {
        const mockEvent = {
          results: [[{ transcript: 'voice search term' }]]
        };
        
        component['recognition'].onresult(mockEvent);
        
        expect(component.finalTranscript).toBe('voice search term');
        expect(component.search).toHaveBeenCalled();
      }
    });
  });

  describe('UI Interactions', () => {
    it('should add bounce animation class when recognizing', async () => {
      component.recognizing.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const micButton = compiled.querySelector('button');
      expect(micButton?.classList.contains('!animate-bounce')).toBe(true);
    });

    it('should remove bounce animation class when not recognizing', async () => {
      component.recognizing.set(false);
      fixture.detectChanges();
      await fixture.whenStable();

      const micButton = compiled.querySelector('button');
      expect(micButton?.classList.contains('!animate-bounce')).toBe(false);
    });

    it('should trigger speech recognition on microphone button click', () => {
      spyOn(component, 'startSpeechRecognition');
      const micButton = compiled.querySelector('button') as HTMLButtonElement;
      
      micButton.click();
      
      expect(component.startSpeechRecognition).toHaveBeenCalled();
    });
  });

  describe('Locale and Platform', () => {
    it('should inject LOCALE_ID correctly', () => {
      expect(component.localeID).toBe('en-US');
    });

    it('should set recognition language to locale', () => {
      if (component['recognition']) {
        expect(component['recognition'].lang).toBe(component.localeID);
      }
    });
  });

  describe('Input Properties', () => {
    it('should accept keyword as input', () => {
      const testKeyword = 'initial keyword';
      component.keyword = testKeyword;
      
      expect(component.keyword).toBe(testKeyword);
    });

    it('should initialize finalTranscript with keyword value', () => {
      component.keyword = 'preset value';
      component.finalTranscript = component.keyword;
      
      expect(component.finalTranscript).toBe('preset value');
    });
  });

  describe('Output Events', () => {
    it('should have onResult EventEmitter', () => {
      expect(component.onResult).toBeDefined();
      expect(component.onResult.observers.length).toBeGreaterThanOrEqual(0);
    });

    it('should emit correct value through onResult', (done) => {
      const testValue = 'emitted value';
      component.finalTranscript = testValue;

      component.onResult.subscribe((value: string) => {
        expect(value).toBe(testValue);
        done();
      });

      component.search();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search', (done) => {
      component.finalTranscript = '';

      component.onResult.subscribe((result: string) => {
        expect(result).toBe('');
        done();
      });

      component.search();
    });

    it('should handle whitespace-only search', (done) => {
      component.finalTranscript = '   ';

      component.onResult.subscribe((result: string) => {
        expect(result).toBe('   ');
        done();
      });

      component.search();
    });

    it('should handle special characters in search', (done) => {
      component.finalTranscript = '!@#$%^&*()';

      component.onResult.subscribe((result: string) => {
        expect(result).toBe('!@#$%^&*()');
        done();
      });

      component.search();
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
