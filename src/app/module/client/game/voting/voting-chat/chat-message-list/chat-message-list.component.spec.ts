import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ChatMessageListComponent } from './chat-message-list.component';
import { ChatMessage, ChatMessageType } from '@/types/chat.type';

// ---- Stub ----------------------------------------------------------------

@Component({
  selector: 'app-chat-message',
  standalone: true,
  template: '<div class="stub-chat-message"></div>',
})
class ChatMessageStubComponent {
  @Input() message: any;
  @Input() isOwnMessage = false;
  @Input() availableReactions: string[] = [];
  @Output() reactionAdded = new EventEmitter<{ messageId: string; reaction: string }>();
}

// ---- Helpers -------------------------------------------------------------

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    content: 'Hello world',
    senderId: 'user-1',
    senderName: 'User One',
    type: ChatMessageType.TEXT,
    timestamp: 1700000000000,
    reactions: {},
    roomId: 'room-1',
    ...overrides,
  };
}

// ---- Suite ---------------------------------------------------------------

describe('ChatMessageListComponent', () => {
  let component: ChatMessageListComponent;
  let fixture: ComponentFixture<ChatMessageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageListComponent, NoopAnimationsModule],
    })
      .overrideComponent(ChatMessageListComponent, {
        set: {
          imports: [
            CommonModule,
            MatButtonModule,
            MatIconModule,
            ChatMessageStubComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ChatMessageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---- Creation ----------------------------------------------------------

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default inputs', () => {
      expect(component.messages).toEqual([]);
      expect(component.isConnected).toBeFalse();
      expect(component.currentUserId).toBeNull();
      expect(component.availableReactions).toEqual([]);
    });
  });

  // ---- isOwnMessage ------------------------------------------------------

  describe('isOwnMessage()', () => {
    it('should return false when currentUserId is null', () => {
      component.currentUserId = null;
      const msg = makeMessage({ senderId: 'user-1' });
      expect(component.isOwnMessage(msg)).toBeFalse();
    });

    it('should return false when currentUserId is empty string', () => {
      component.currentUserId = '';
      const msg = makeMessage({ senderId: 'user-1' });
      expect(component.isOwnMessage(msg)).toBeFalse();
    });

    it('should return true when senderId matches currentUserId', () => {
      component.currentUserId = 'user-1';
      const msg = makeMessage({ senderId: 'user-1' });
      expect(component.isOwnMessage(msg)).toBeTrue();
    });

    it('should return false when senderId does not match currentUserId', () => {
      component.currentUserId = 'user-2';
      const msg = makeMessage({ senderId: 'user-1' });
      expect(component.isOwnMessage(msg)).toBeFalse();
    });
  });

  // ---- onReactionAdded ---------------------------------------------------

  describe('onReactionAdded()', () => {
    it('should emit reactionAdded with the event payload', () => {
      const emitted: any[] = [];
      component.reactionAdded.subscribe((v) => emitted.push(v));

      const evt = { messageId: 'msg-1', reaction: '👍' };
      component.onReactionAdded(evt);

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual(evt);
    });

    it('should forward different reactions correctly', () => {
      const emitted: any[] = [];
      component.reactionAdded.subscribe((v) => emitted.push(v));

      component.onReactionAdded({ messageId: 'msg-2', reaction: '❤️' });
      component.onReactionAdded({ messageId: 'msg-3', reaction: '😂' });

      expect(emitted.length).toBe(2);
      expect(emitted[1]).toEqual({ messageId: 'msg-3', reaction: '😂' });
    });
  });

  // ---- onLoadMore --------------------------------------------------------

  describe('onLoadMore()', () => {
    it('should emit loadMore', () => {
      let emitCount = 0;
      component.loadMore.subscribe(() => emitCount++);

      component.onLoadMore();

      expect(emitCount).toBe(1);
    });

    it('should emit loadMore on each call', () => {
      let emitCount = 0;
      component.loadMore.subscribe(() => emitCount++);

      component.onLoadMore();
      component.onLoadMore();

      expect(emitCount).toBe(2);
    });
  });

  // ---- markForScroll -----------------------------------------------------

  describe('markForScroll()', () => {
    it('should set shouldScrollToBottom to true', () => {
      (component as any).shouldScrollToBottom = false;
      component.markForScroll();
      expect((component as any).shouldScrollToBottom).toBeTrue();
    });

    it('should trigger scrollToBottom on next ngAfterViewChecked', () => {
      const spy = spyOn<any>(component, 'scrollToBottom');
      (component as any).shouldScrollToBottom = false;

      component.markForScroll();
      component.ngAfterViewChecked();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should reset shouldScrollToBottom to false after ngAfterViewChecked', () => {
      component.markForScroll();
      component.ngAfterViewChecked();
      expect((component as any).shouldScrollToBottom).toBeFalse();
    });
  });

  // ---- ngAfterViewChecked ------------------------------------------------

  describe('ngAfterViewChecked()', () => {
    it('should call scrollToBottom when shouldScrollToBottom is true', () => {
      const spy = spyOn<any>(component, 'scrollToBottom');
      (component as any).shouldScrollToBottom = true;

      component.ngAfterViewChecked();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should NOT call scrollToBottom when shouldScrollToBottom is false', () => {
      const spy = spyOn<any>(component, 'scrollToBottom');
      (component as any).shouldScrollToBottom = false;

      component.ngAfterViewChecked();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should set shouldScrollToBottom to false after scrolling', () => {
      spyOn<any>(component, 'scrollToBottom');
      (component as any).shouldScrollToBottom = true;

      component.ngAfterViewChecked();

      expect((component as any).shouldScrollToBottom).toBeFalse();
    });
  });

  // ---- trackByMessageId --------------------------------------------------

  describe('trackByMessageId()', () => {
    it('should return the message id', () => {
      const msg = makeMessage({ id: 'abc-123' });
      expect(component.trackByMessageId(0, msg)).toBe('abc-123');
    });

    it('should return different ids for different messages', () => {
      const msg1 = makeMessage({ id: 'id-1' });
      const msg2 = makeMessage({ id: 'id-2' });
      expect(component.trackByMessageId(0, msg1)).not.toBe(component.trackByMessageId(1, msg2));
    });
  });

  // ---- scrollToBottom (private) ------------------------------------------

  describe('scrollToBottom() [private]', () => {
    it('should set scrollTop to scrollHeight on the container', () => {
      const container = fixture.debugElement.query(By.css('[\\#messagesContainer]'))
        ?? { nativeElement: null };

      const fakeEl = { scrollTop: 0, scrollHeight: 500 };
      (component as any).messagesContainer = { nativeElement: fakeEl };

      (component as any).scrollToBottom();

      expect(fakeEl.scrollTop).toBe(500);
    });

    it('should not throw when messagesContainer is undefined', () => {
      (component as any).messagesContainer = undefined;
      expect(() => (component as any).scrollToBottom()).not.toThrow();
    });

    it('should not throw when nativeElement is null', () => {
      (component as any).messagesContainer = { nativeElement: null };
      expect(() => (component as any).scrollToBottom()).not.toThrow();
    });
  });

  // ---- Template: Load More button ----------------------------------------

  describe('Load More button', () => {
    it('should NOT render when messages is empty', () => {
      component.messages = [];
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[mat-button]'));
      expect(btn).toBeNull();
    });

    it('should render when messages has at least one item', () => {
      component.messages = [makeMessage()];
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[mat-button]'));
      expect(btn).not.toBeNull();
    });

    it('should call onLoadMore when clicked', () => {
      component.messages = [makeMessage()];
      fixture.detectChanges();
      const spy = spyOn(component, 'onLoadMore');
      const btn = fixture.debugElement.query(By.css('button[mat-button]'));
      btn.triggerEventHandler('click', null);
      expect(spy).toHaveBeenCalled();
    });

    it('should emit loadMore when Load More button is clicked', () => {
      let emitCount = 0;
      component.loadMore.subscribe(() => emitCount++);
      component.messages = [makeMessage()];
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[mat-button]'));
      btn.triggerEventHandler('click', null);
      expect(emitCount).toBe(1);
    });
  });

  // ---- Template: Messages list -------------------------------------------

  describe('messages list', () => {
    it('should render one app-chat-message per message', () => {
      component.messages = [makeMessage({ id: 'a' }), makeMessage({ id: 'b' }), makeMessage({ id: 'c' })];
      fixture.detectChanges();
      const items = fixture.debugElement.queryAll(By.css('app-chat-message'));
      expect(items.length).toBe(3);
    });

    it('should render no app-chat-message when messages is empty', () => {
      component.messages = [];
      fixture.detectChanges();
      const items = fixture.debugElement.queryAll(By.css('app-chat-message'));
      expect(items.length).toBe(0);
    });

    it('should pass isOwnMessage correctly to each chat-message stub', () => {
      component.currentUserId = 'me';
      component.messages = [
        makeMessage({ id: 'a', senderId: 'me' }),
        makeMessage({ id: 'b', senderId: 'other' }),
      ];
      fixture.detectChanges();

      const stubs = fixture.debugElement.queryAll(By.directive(ChatMessageStubComponent));
      const instances = stubs.map((s) => s.componentInstance as ChatMessageStubComponent);

      expect(instances[0].isOwnMessage).toBeTrue();
      expect(instances[1].isOwnMessage).toBeFalse();
    });

    it('should pass availableReactions to each chat-message stub', () => {
      component.availableReactions = ['👍', '❤️'];
      component.messages = [makeMessage()];
      fixture.detectChanges();

      const stub = fixture.debugElement.query(By.directive(ChatMessageStubComponent))
        .componentInstance as ChatMessageStubComponent;

      expect(stub.availableReactions).toEqual(['👍', '❤️']);
    });

    it('should emit reactionAdded when child emits it', () => {
      component.messages = [makeMessage()];
      fixture.detectChanges();

      const emitted: any[] = [];
      component.reactionAdded.subscribe((v) => emitted.push(v));

      const stub = fixture.debugElement.query(By.directive(ChatMessageStubComponent))
        .componentInstance as ChatMessageStubComponent;

      stub.reactionAdded.emit({ messageId: 'msg-1', reaction: '👍' });

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual({ messageId: 'msg-1', reaction: '👍' });
    });
  });

  // ---- Template: Empty state ---------------------------------------------

  describe('empty state', () => {
    it('should show empty state when messages is empty AND isConnected is true', () => {
      component.messages = [];
      component.isConnected = true;
      fixture.detectChanges();
      const emptyState = fixture.debugElement.query(By.css('mat-icon'));
      expect(emptyState).not.toBeNull();
    });

    it('should NOT show empty state when messages is empty AND isConnected is false', () => {
      component.messages = [];
      component.isConnected = false;
      fixture.detectChanges();
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeNull();
    });

    it('should NOT show empty state when messages exist even if connected', () => {
      component.messages = [makeMessage()];
      component.isConnected = true;
      fixture.detectChanges();
      // The mat-icon inside the empty state section won't be present
      const emptyWrapper = fixture.nativeElement.querySelector('.flex.flex-col.items-center');
      expect(emptyWrapper).toBeNull();
    });
  });
});
