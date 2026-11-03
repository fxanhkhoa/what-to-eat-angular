import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ChatInputComponent } from './chat-input.component';

describe('ChatInputComponent', () => {
  let component: ChatInputComponent;
  let fixture: ComponentFixture<ChatInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInputComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInputComponent);
    component = fixture.componentInstance;
    component.isConnected = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial state ──────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should start with messageText = ""', () => {
      expect(component.messageText()).toBe('');
    });

    it('should default isConnected to false when not set', () => {
      const f2 = TestBed.createComponent(ChatInputComponent);
      expect(f2.componentInstance.isConnected).toBeFalse();
      f2.destroy();
    });
  });

  // ── onMessageInput ─────────────────────────────────────────────────────────

  describe('onMessageInput', () => {
    function makeInputEvent(value: string): Event {
      const event = new Event('input');
      Object.defineProperty(event, 'target', {
        value: { value } as HTMLTextAreaElement,
        writable: false,
      });
      return event;
    }

    it('should update messageText signal', () => {
      component.onMessageInput(makeInputEvent('Hello'));
      expect(component.messageText()).toBe('Hello');
    });

    it('should emit messageInput with the typed value', () => {
      let emitted: string | undefined;
      component.messageInput.subscribe((v) => (emitted = v));
      component.onMessageInput(makeInputEvent('World'));
      expect(emitted).toBe('World');
    });

    it('should handle empty string from event target', () => {
      component.onMessageInput(makeInputEvent(''));
      expect(component.messageText()).toBe('');
    });

    it('should handle event with no target gracefully', () => {
      const event = new Event('input');
      expect(() => component.onMessageInput(event)).not.toThrow();
      expect(component.messageText()).toBe('');
    });
  });

  // ── onKeyDown ──────────────────────────────────────────────────────────────

  describe('onKeyDown', () => {
    it('should call sendMessage when Enter is pressed without Shift', () => {
      spyOn(component, 'sendMessage');
      component.messageText.set('Hello');
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      component.onKeyDown(event);
      expect(component.sendMessage).toHaveBeenCalled();
    });

    it('should NOT call sendMessage when Enter + Shift is pressed', () => {
      spyOn(component, 'sendMessage');
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      component.onKeyDown(event);
      expect(component.sendMessage).not.toHaveBeenCalled();
    });

    it('should prevent default when Enter is pressed without Shift', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should NOT prevent default for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  // ── sendMessage ────────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('should emit messageSent with trimmed text', () => {
      let emitted: string | undefined;
      component.messageSent.subscribe((v) => (emitted = v));
      component.messageText.set('  Hello  ');
      component.sendMessage();
      expect(emitted).toBe('Hello');
    });

    it('should clear messageText after sending', () => {
      component.messageText.set('Hello');
      component.sendMessage();
      expect(component.messageText()).toBe('');
    });

    it('should NOT emit when text is empty', () => {
      let emitted = false;
      component.messageSent.subscribe(() => (emitted = true));
      component.messageText.set('');
      component.sendMessage();
      expect(emitted).toBeFalse();
    });

    it('should NOT emit when text is whitespace only', () => {
      let emitted = false;
      component.messageSent.subscribe(() => (emitted = true));
      component.messageText.set('   ');
      component.sendMessage();
      expect(emitted).toBeFalse();
    });

    it('should NOT emit when isConnected is false', () => {
      component.isConnected = false;
      let emitted = false;
      component.messageSent.subscribe(() => (emitted = true));
      component.messageText.set('Hello');
      component.sendMessage();
      expect(emitted).toBeFalse();
    });

    it('should focus the textarea after 100ms', fakeAsync(() => {
      component.messageText.set('Hi');
      fixture.detectChanges();
      const textarea = fixture.debugElement.query(By.css('textarea'));
      spyOn(textarea.nativeElement, 'focus');
      component.sendMessage();
      tick(100);
      expect(textarea.nativeElement.focus).toHaveBeenCalled();
    }));
  });

  // ── template ───────────────────────────────────────────────────────────────

  describe('template', () => {
    it('should render the textarea', () => {
      const textarea = fixture.debugElement.query(By.css('textarea'));
      expect(textarea).toBeTruthy();
    });

    it('should render the send button', () => {
      const btn = fixture.debugElement.query(By.css('button[mat-fab]'));
      expect(btn).toBeTruthy();
    });

    it('should disable the textarea when isConnected is false', () => {
      component.isConnected = false;
      fixture.detectChanges();
      const textarea = fixture.debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.disabled).toBeTrue();
    });

    it('should enable the textarea when isConnected is true', () => {
      component.isConnected = true;
      fixture.detectChanges();
      const textarea = fixture.debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.disabled).toBeFalse();
    });

    it('should disable the send button when messageText is empty', () => {
      component.messageText.set('');
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[mat-fab]'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should disable the send button when isConnected is false', () => {
      component.isConnected = false;
      component.messageText.set('Hello');
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[mat-fab]'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should enable the send button when text is non-empty and connected', () => {
      component.isConnected = true;
      component.messageText.set('Hello');
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[mat-fab]'));
      expect(btn.nativeElement.disabled).toBeFalse();
    });

    it('should show character hint when messageText length exceeds 200', () => {
      component.messageText.set('a'.repeat(201));
      fixture.detectChanges();
      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint).toBeTruthy();
      expect(hint.nativeElement.textContent).toContain('201');
    });

    it('should NOT show character hint when messageText length is 200 or less', () => {
      component.messageText.set('a'.repeat(200));
      fixture.detectChanges();
      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });

    it('should call sendMessage when send button is clicked', () => {
      spyOn(component, 'sendMessage');
      component.messageText.set('Hello');
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[mat-fab]'));
      btn.nativeElement.click();
      expect(component.sendMessage).toHaveBeenCalled();
    });

    it('should render a mat-icon with "send"', () => {
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('send');
    });
  });
});
