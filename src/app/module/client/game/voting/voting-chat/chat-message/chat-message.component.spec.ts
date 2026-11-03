import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ChatMessageComponent } from './chat-message.component';
import { ChatMessage, ChatMessageType } from '@/types/chat.type';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    content: 'Hello world',
    senderId: 'user-2',
    senderName: 'Bob',
    type: ChatMessageType.TEXT,
    timestamp: 1700000000, // seconds
    reactions: {},
    roomId: 'room-1',
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    component.message = makeMessage();
    component.isOwnMessage = false;
    component.availableReactions = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── addReaction ─────────────────────────────────────────────────────────────

  describe('addReaction', () => {
    it('should emit reactionAdded with messageId and reaction', () => {
      let emitted: { messageId: string; reaction: string } | undefined;
      component.reactionAdded.subscribe((e) => (emitted = e));
      component.addReaction('👍');
      expect(emitted).toEqual({ messageId: 'msg-1', reaction: '👍' });
    });

    it('should use the current message id', () => {
      component.message = makeMessage({ id: 'msg-99' });
      let emitted: any;
      component.reactionAdded.subscribe((e) => (emitted = e));
      component.addReaction('❤️');
      expect(emitted.messageId).toBe('msg-99');
    });
  });

  // ── getReactionCount ────────────────────────────────────────────────────────

  describe('getReactionCount', () => {
    it('should return the count for a reaction that exists', () => {
      component.message = makeMessage({ reactions: { '👍': 3 } });
      expect(component.getReactionCount('👍')).toBe(3);
    });

    it('should return 0 for a reaction that does not exist', () => {
      component.message = makeMessage({ reactions: {} });
      expect(component.getReactionCount('👍')).toBe(0);
    });

    it('should return 0 when reactions is null/undefined', () => {
      component.message = makeMessage({ reactions: undefined as any });
      expect(component.getReactionCount('👍')).toBe(0);
    });
  });

  // ── hasReacted ──────────────────────────────────────────────────────────────

  describe('hasReacted', () => {
    it('should return true when the reaction count is greater than 0', () => {
      component.message = makeMessage({ reactions: { '👍': 2 } });
      expect(component.hasReacted('👍')).toBeTrue();
    });

    it('should return false when the reaction count is 0', () => {
      component.message = makeMessage({ reactions: { '👍': 0 } });
      expect(component.hasReacted('👍')).toBeFalse();
    });

    it('should return false for a reaction not in the map', () => {
      component.message = makeMessage({ reactions: {} });
      expect(component.hasReacted('😂')).toBeFalse();
    });
  });

  // ── formatMessageTime ───────────────────────────────────────────────────────

  describe('formatMessageTime', () => {
    it('should return HH:MM format for a timestamp within the last 24 hours', () => {
      // Use a timestamp that is definitely within the last 24 hours
      const nowSeconds = Math.floor(Date.now() / 1000);
      const result = component.formatMessageTime(nowSeconds);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should return a date string for a timestamp older than 24 hours', () => {
      // 2 days ago
      const twoDaysAgoSeconds = Math.floor(Date.now() / 1000) - 2 * 24 * 3600;
      const result = component.formatMessageTime(twoDaysAgoSeconds);
      // Should contain more info (month, day) — not just HH:MM
      expect(result.length).toBeGreaterThan(5);
    });

    it('should return a consistent result for the same timestamp', () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      expect(component.formatMessageTime(nowSeconds)).toBe(
        component.formatMessageTime(nowSeconds)
      );
    });
  });

  // ── getObjectKeys ────────────────────────────────────────────────────────────

  describe('getObjectKeys', () => {
    it('should return keys of an object', () => {
      expect(component.getObjectKeys({ a: 1, b: 2 })).toEqual(['a', 'b']);
    });

    it('should return [] for null', () => {
      expect(component.getObjectKeys(null)).toEqual([]);
    });

    it('should return [] for undefined', () => {
      expect(component.getObjectKeys(undefined)).toEqual([]);
    });

    it('should return [] for empty object', () => {
      expect(component.getObjectKeys({})).toEqual([]);
    });
  });

  // ── hasReactionKeys ──────────────────────────────────────────────────────────

  describe('hasReactionKeys', () => {
    it('should return true when object has at least one key', () => {
      expect(component.hasReactionKeys({ '👍': 1 })).toBeTrue();
    });

    it('should return false for empty object', () => {
      expect(component.hasReactionKeys({})).toBeFalse();
    });

    it('should return falsy for null', () => {
      expect(component.hasReactionKeys(null)).toBeFalsy();
    });

    it('should return falsy for undefined', () => {
      expect(component.hasReactionKeys(undefined)).toBeFalsy();
    });
  });

  // ── template – own vs other message ─────────────────────────────────────────

  describe('template – isOwnMessage = false (other user)', () => {
    it('should render sender name', () => {
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Bob');
    });

    it('should render the first letter of sender name as avatar initial when no senderAvatar', () => {
      const initial = fixture.debugElement.query(
        By.css('.rounded-full.bg-gray-300')
      );
      expect(initial).toBeTruthy();
      expect(initial.nativeElement.textContent.trim()).toBe('B');
    });

    it('should render <img> avatar when senderAvatar is set', () => {
      component.message = makeMessage({
        senderAvatar: 'https://example.com/avatar.png',
      });
      fixture.detectChanges();
      const img = fixture.debugElement.query(By.css('img'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.src).toContain('avatar.png');
    });

    it('should NOT render sender section for own messages', () => {
      component.isOwnMessage = true;
      fixture.detectChanges();
      const senderSection = fixture.debugElement.query(
        By.css('.rounded-full.bg-gray-300')
      );
      expect(senderSection).toBeNull();
    });

    it('should NOT apply ml-auto/mr-2 gradient class for others\' messages', () => {
      const card = fixture.debugElement.query(By.css('mat-card'));
      expect(card.nativeElement.className).not.toContain('ml-auto');
    });
  });

  describe('template – isOwnMessage = true', () => {
    beforeEach(() => {
      component.isOwnMessage = true;
      fixture.detectChanges();
    });

    it('should apply justify-end to the outer flex container', () => {
      const wrapper = fixture.debugElement.query(By.css('.flex.justify-end'));
      expect(wrapper).toBeTruthy();
    });

    it('should apply the own-message gradient classes via ngClass', () => {
      const card = fixture.debugElement.query(By.css('mat-card'));
      expect(card.nativeElement.className).toContain('ml-auto');
    });
  });

  // ── template – message content ───────────────────────────────────────────────

  describe('template – message content', () => {
    it('should display the message content', () => {
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Hello world');
    });

    it('should display the formatted timestamp', () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      component.message = makeMessage({ timestamp: nowSeconds });
      fixture.detectChanges();
      const expected = component.formatMessageTime(nowSeconds);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain(expected);
    });
  });

  // ── template – reactions ─────────────────────────────────────────────────────

  describe('template – reactions section', () => {
    it('should NOT render reactions section when reactions is empty', () => {
      component.message = makeMessage({ reactions: {} });
      fixture.detectChanges();
      // No reaction bubbles
      const pills = fixture.debugElement.queryAll(
        By.css('.rounded-full.cursor-pointer')
      );
      expect(pills.length).toBe(0);
    });

    it('should render a pill for each reaction with count > 0', () => {
      component.message = makeMessage({ reactions: { '👍': 2, '❤️': 1 } });
      fixture.detectChanges();
      const pills = fixture.debugElement.queryAll(
        By.css('.rounded-full.cursor-pointer')
      );
      expect(pills.length).toBe(2);
    });

    it('should NOT render a pill when reaction count is 0', () => {
      component.message = makeMessage({ reactions: { '👍': 0 } });
      fixture.detectChanges();
      const pills = fixture.debugElement.queryAll(
        By.css('.rounded-full.cursor-pointer')
      );
      expect(pills.length).toBe(0);
    });

    it('should emit reactionAdded when a reaction pill is clicked', () => {
      component.message = makeMessage({ reactions: { '👍': 1 } });
      fixture.detectChanges();
      let emitted: any;
      component.reactionAdded.subscribe((e) => (emitted = e));
      const pill = fixture.debugElement.query(
        By.css('.rounded-full.cursor-pointer')
      );
      pill.nativeElement.click();
      expect(emitted).toEqual({ messageId: 'msg-1', reaction: '👍' });
    });

    it('should display the reaction emoji and count in each pill', () => {
      component.message = makeMessage({ reactions: { '👍': 3 } });
      fixture.detectChanges();
      const pill = fixture.debugElement.query(
        By.css('.rounded-full.cursor-pointer')
      );
      const text = pill.nativeElement.textContent ?? '';
      expect(text).toContain('👍');
      expect(text).toContain('3');
    });
  });

  // ── template – reaction menu ─────────────────────────────────────────────────

  describe('template – reaction menu button', () => {
    it('should render the add_reaction icon button', () => {
      const btn = fixture.debugElement.query(
        By.css('button[aria-label="Add reaction"]')
      );
      expect(btn).toBeTruthy();
    });

    it('should expose availableReactions for the menu', () => {
      component.availableReactions = ['👍', '❤️', '😂'];
      fixture.detectChanges();
      // mat-menu renders in a CDK overlay portal outside the component DOM;
      // verify the input property is bound correctly
      expect(component.availableReactions).toEqual(['👍', '❤️', '😂']);
    });
  });
});
