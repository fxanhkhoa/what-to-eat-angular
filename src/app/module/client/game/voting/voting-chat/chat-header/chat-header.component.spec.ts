import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ChatHeaderComponent } from './chat-header.component';

describe('ChatHeaderComponent', () => {
  let component: ChatHeaderComponent;
  let fixture: ComponentFixture<ChatHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatHeaderComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── @Input setters → signals ───────────────────────────────────────────────

  describe('@Input() onlineCount', () => {
    it('should update _onlineCount signal', () => {
      component.onlineCount = 5;
      expect(component._onlineCount()).toBe(5);
    });

    it('should start at 0 by default', () => {
      expect(component._onlineCount()).toBe(0);
    });
  });

  describe('@Input() isConnected', () => {
    it('should update _isConnected signal to true', () => {
      component.isConnected = true;
      expect(component._isConnected()).toBeTrue();
    });

    it('should update _isConnected signal to false', () => {
      component.isConnected = true;
      component.isConnected = false;
      expect(component._isConnected()).toBeFalse();
    });

    it('should start as false by default', () => {
      expect(component._isConnected()).toBeFalse();
    });
  });

  describe('@Input() connectionError', () => {
    it('should update _connectionError signal', () => {
      component.connectionError = 'Connection failed';
      expect(component._connectionError()).toBe('Connection failed');
    });

    it('should accept null', () => {
      component.connectionError = 'err';
      component.connectionError = null;
      expect(component._connectionError()).toBeNull();
    });

    it('should start as null by default', () => {
      expect(component._connectionError()).toBeNull();
    });
  });

  // ── formatUserCount ────────────────────────────────────────────────────────

  describe('formatUserCount', () => {
    it('should return "No one online" for 0', () => {
      expect(component.formatUserCount(0)).toContain('No one online');
    });

    it('should return "1 person online" for 1', () => {
      expect(component.formatUserCount(1)).toContain('1 person online');
    });

    it('should return "{count} people online" for >1', () => {
      expect(component.formatUserCount(3)).toContain('3');
      expect(component.formatUserCount(3)).toContain('people online');
    });

    it('should handle large numbers', () => {
      const result = component.formatUserCount(999);
      expect(result).toContain('999');
    });
  });

  // ── onReconnect ────────────────────────────────────────────────────────────

  describe('onReconnect', () => {
    it('should emit the reconnect output event', () => {
      let emitted = false;
      component.reconnect.subscribe(() => (emitted = true));
      component.onReconnect();
      expect(emitted).toBeTrue();
    });
  });

  // ── animation signals ──────────────────────────────────────────────────────

  describe('online count animation', () => {
    it('should set animationType to "increase" when count rises', fakeAsync(() => {
      component.onlineCount = 0;
      fixture.detectChanges();
      component.onlineCount = 3;
      fixture.detectChanges();
      tick(0); // allow effect to run
      expect(component.animationType()).toBe('increase');
    }));

    it('should set animationType to "decrease" when count falls', fakeAsync(() => {
      component.onlineCount = 5;
      fixture.detectChanges();
      tick(0);
      // reset previous to 5 manually since effect already ran in beforeEach
      component.previousOnlineCount.set(5);
      component.onlineCount = 2;
      fixture.detectChanges();
      tick(0);
      expect(component.animationType()).toBe('decrease');
    }));

    it('should set isOnlineCountAnimating to true when count changes', fakeAsync(() => {
      component.onlineCount = 1;
      fixture.detectChanges();
      tick(0);
      expect(component.isOnlineCountAnimating()).toBeTrue();
    }));

    it('should reset isOnlineCountAnimating to false after 600ms', fakeAsync(() => {
      component.onlineCount = 1;
      fixture.detectChanges();
      tick(600);
      expect(component.isOnlineCountAnimating()).toBeFalse();
    }));

    it('should reset animationType to "none" after 600ms', fakeAsync(() => {
      component.onlineCount = 1;
      fixture.detectChanges();
      tick(600);
      expect(component.animationType()).toBe('none');
    }));

    it('should update previousOnlineCount to the new count', fakeAsync(() => {
      component.onlineCount = 7;
      fixture.detectChanges();
      tick(0);
      expect(component.previousOnlineCount()).toBe(7);
    }));

    it('should start with animationType "none"', () => {
      expect(component.animationType()).toBe('none');
    });

    it('should start with isOnlineCountAnimating false', () => {
      expect(component.isOnlineCountAnimating()).toBeFalse();
    });
  });

  // ── template ───────────────────────────────────────────────────────────────

  describe('template', () => {
    it('should render wifi icon when connected', () => {
      component.isConnected = true;
      fixture.detectChanges();
      const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
      const iconTexts = icons.map((i) => i.nativeElement.textContent.trim());
      expect(iconTexts).toContain('wifi');
    });

    it('should render wifi_off icon when disconnected', () => {
      component.isConnected = false;
      fixture.detectChanges();
      const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
      const iconTexts = icons.map((i) => i.nativeElement.textContent.trim());
      expect(iconTexts).toContain('wifi_off');
    });

    it('should display the online count', () => {
      component.onlineCount = 4;
      fixture.detectChanges();
      const countEl = fixture.debugElement.query(
        By.css('.online-count-number')
      );
      expect(countEl.nativeElement.textContent.trim()).toBe('4');
    });

    it('should not render the error section when connectionError is null', () => {
      component.connectionError = null;
      fixture.detectChanges();
      const errorDiv = fixture.debugElement.query(By.css('.bg-red-100'));
      expect(errorDiv).toBeNull();
    });

    it('should render the error section when connectionError is set', () => {
      component.connectionError = 'Lost connection';
      fixture.detectChanges();
      const errorDiv = fixture.debugElement.query(By.css('.bg-red-100'));
      expect(errorDiv).toBeTruthy();
    });

    it('should display the error message text', () => {
      component.connectionError = 'Lost connection';
      fixture.detectChanges();
      const hostText = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(hostText).toContain('Lost connection');
    });

    it('should emit reconnect when Reconnect button is clicked', () => {
      component.connectionError = 'err';
      fixture.detectChanges();
      let emitted = false;
      component.reconnect.subscribe(() => (emitted = true));
      const button = fixture.debugElement.query(By.css('button[mat-button]'));
      button.nativeElement.click();
      expect(emitted).toBeTrue();
    });

    it('should apply text-green-300 class when connected', () => {
      component.isConnected = true;
      fixture.detectChanges();
      const statusDiv = fixture.debugElement.query(By.css('.text-green-300'));
      expect(statusDiv).toBeTruthy();
    });

    it('should not apply text-green-300 class when disconnected', () => {
      component.isConnected = false;
      fixture.detectChanges();
      const statusDiv = fixture.debugElement.query(By.css('.text-green-300'));
      expect(statusDiv).toBeNull();
    });

    it('should apply text-red-300 class when connectionError is set', () => {
      component.connectionError = 'Error!';
      fixture.detectChanges();
      const errStatusDiv = fixture.debugElement.query(By.css('.text-red-300'));
      expect(errStatusDiv).toBeTruthy();
    });

    it('should show "Voting Chat" heading text', () => {
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Voting Chat');
    });
  });
});
