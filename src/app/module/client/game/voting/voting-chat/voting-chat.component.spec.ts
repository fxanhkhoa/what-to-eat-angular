import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { VotingChatComponent } from './voting-chat.component';
import { ChatSocketService } from '@/app/service/chat-socket.service';
import { AuthService } from '@/app/service/auth.service';
import { UserService } from '@/app/service/user.service';
import { ChatMessage, ChatMessageType, ChatUser } from '@/types/chat.type';
import { User } from '@/types/user.type';

// ── Stubs ─────────────────────────────────────────────────────────────────────

@Component({ selector: 'app-chat-header', template: '', standalone: true })
class ChatHeaderStub {
  @Input() onlineCount: number = 0;
  @Input() isConnected: boolean = false;
  @Input() connectionError: string | null = null;
  @Output() reconnect = new EventEmitter<void>();
}

@Component({ selector: 'app-chat-message-list', template: '', standalone: true })
class ChatMessageListStub {
  @Input() messages: any[] = [];
  @Input() isConnected = false;
  @Input() currentUserId: string | null = null;
  @Input() availableReactions: string[] = [];
  @Output() reactionAdded = new EventEmitter<{ messageId: string; reaction: string }>();
  @Output() loadMore = new EventEmitter<void>();
  markForScroll = jasmine.createSpy('markForScroll');
}

@Component({ selector: 'app-chat-input', template: '', standalone: true })
class ChatInputStub {
  @Input() isConnected = false;
  @Output() messageSent = new EventEmitter<string>();
  @Output() messageInput = new EventEmitter<string>();
}

@Component({ selector: 'app-typing-indicator', template: '', standalone: true })
class TypingIndicatorStub {
  @Input() typingUserNames: string[] = [];
}

const STUB_IMPORTS = [
  CommonModule,
  MatCardModule,
  MatIconModule,
  MatExpansionModule,
  DragDropModule,
  ChatHeaderStub,
  ChatMessageListStub,
  ChatInputStub,
  TypingIndicatorStub,
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUser(id = 'user-1', name = 'Alice'): User {
  return {
    _id: id, email: 'a@b.com', name, roleName: 'user',
    deleted: false, createdAt: '', updatedAt: '',
  } as User;
}

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1', content: 'Hello', senderId: 'user-2', senderName: 'Bob',
    type: ChatMessageType.TEXT, timestamp: Date.now(), reactions: {}, roomId: 'room-1',
    ...overrides,
  };
}

function makeChatUser(id = 'user-2', name = 'Bob'): ChatUser {
  return { id, name, isOnline: true };
}

// ── Fake ChatSocketService ────────────────────────────────────────────────────

class FakeChatSocketService {
  isConnected$ = new BehaviorSubject<boolean>(false);
  connectionError$ = new BehaviorSubject<string | null>(null);
  messages$ = new BehaviorSubject<ChatMessage[]>([]);
  newMessage$ = new Subject<ChatMessage>();
  onlineUsers$ = new BehaviorSubject<ChatUser[]>([]);
  typingUsers$ = new BehaviorSubject<string[]>([]);

  joinChatRoom = jasmine.createSpy('joinChatRoom');
  leaveChatRoom = jasmine.createSpy('leaveChatRoom');
  loadMessageHistory = jasmine.createSpy('loadMessageHistory');
  sendMessage = jasmine.createSpy('sendMessage');
  startTyping = jasmine.createSpy('startTyping');
  stopTyping = jasmine.createSpy('stopTyping');
  reactToMessage = jasmine.createSpy('reactToMessage');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VotingChatComponent', () => {
  let component: VotingChatComponent;
  let fixture: ComponentFixture<VotingChatComponent>;
  let fakeChatService: FakeChatSocketService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    fakeChatService = new FakeChatSocketService();

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    authServiceSpy.getProfile.and.returnValue(of(makeUser()));

    userServiceSpy = jasmine.createSpyObj('UserService', ['findOne']);
    userServiceSpy.findOne.and.returnValue(of(makeUser('user-2', 'Bob')));

    await TestBed.configureTestingModule({
      imports: [VotingChatComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: ChatSocketService, useValue: fakeChatService },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    })
      .overrideComponent(VotingChatComponent, { set: { imports: STUB_IMPORTS } })
      .compileComponents();

    // Stub out SVG icon registration to avoid HTTP requests
    const registry = TestBed.inject(MatIconRegistry);
    const sanitizer = TestBed.inject(DomSanitizer);
    spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.returnValue('' as any);
    spyOn(registry as any, 'getNamedSvgIcon').and.returnValue(
      of(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    );

    fixture = TestBed.createComponent(VotingChatComponent);
    component = fixture.componentInstance;
    component.roomId = 'room-1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should start with isPanelExpanded = true', () => {
      expect(component.isPanelExpanded()).toBeTrue();
    });

    it('should start with isConnected = false', () => {
      expect(component.isConnected()).toBeFalse();
    });

    it('should start with connectionError = null', () => {
      expect(component.connectionError()).toBeNull();
    });

    it('should start with messages = []', () => {
      expect(component.messages()).toEqual([]);
    });

    it('should start with onlineUsers = []', () => {
      expect(component.onlineUsers()).toEqual([]);
    });

    it('should start with typingUsers = []', () => {
      expect(component.typingUsers()).toEqual([]);
    });

    it('should have dragPosition = { x: 0, y: 0 }', () => {
      expect(component.dragPosition).toEqual({ x: 0, y: 0 });
    });
  });

  // ── ngOnInit subscriptions ────────────────────────────────────────────────

  describe('ngOnInit – subscriptions', () => {
    it('should load profile and call initializeChat (joinChatRoom)', () => {
      expect(authServiceSpy.getProfile).toHaveBeenCalled();
      expect(component.profile()).toEqual(makeUser());
    });

    it('should call chatService.joinChatRoom with roomId after profile loads', () => {
      expect(fakeChatService.joinChatRoom).toHaveBeenCalledWith(
        'room-1', jasmine.any(String), makeUser()._id, makeUser().name!
      );
    });

    it('should call loadMessageHistory after 1000ms', fakeAsync(() => {
      fakeChatService.joinChatRoom.calls.reset();
      fakeChatService.loadMessageHistory.calls.reset();
      // Re-trigger initializeChat by re-emitting profile
      authServiceSpy.getProfile.and.returnValue(of(makeUser()));
      component['initializeChat']();
      tick(1000);
      expect(fakeChatService.loadMessageHistory).toHaveBeenCalledWith(20);
    }));

    it('should update isConnected signal when chatService.isConnected$ emits', () => {
      fakeChatService.isConnected$.next(true);
      expect(component.isConnected()).toBeTrue();
      fakeChatService.isConnected$.next(false);
      expect(component.isConnected()).toBeFalse();
    });

    it('should update connectionError signal', () => {
      fakeChatService.connectionError$.next('Connection failed');
      expect(component.connectionError()).toBe('Connection failed');
      fakeChatService.connectionError$.next(null);
      expect(component.connectionError()).toBeNull();
    });

    it('should update messages signal when chatService.messages$ emits', () => {
      const msgs = [makeMessage()];
      fakeChatService.messages$.next(msgs);
      expect(component.messages()).toEqual(msgs);
    });

    it('should update onlineUsers signal when chatService.onlineUsers$ emits', () => {
      const users = [makeChatUser()];
      fakeChatService.onlineUsers$.next(users);
      expect(component.onlineUsers()).toEqual(users);
    });

    it('should resolve missing user names via userService when online user has no name', () => {
      const userWithoutName: ChatUser = { id: 'u-x', name: '', isOnline: true };
      fakeChatService.onlineUsers$.next([userWithoutName]);
      expect(userServiceSpy.findOne).toHaveBeenCalledWith('u-x');
      expect(userWithoutName.name).toBe('Bob');
    });

    it('should not call userService for online users that already have names', () => {
      userServiceSpy.findOne.calls.reset();
      fakeChatService.onlineUsers$.next([makeChatUser('u-1', 'Alice')]);
      expect(userServiceSpy.findOne).not.toHaveBeenCalled();
    });

    it('should update typingUsers signal', () => {
      fakeChatService.typingUsers$.next(['user-2']);
      expect(component.typingUsers()).toEqual(['user-2']);
    });
  });

  // ── computed: onlineCount ─────────────────────────────────────────────────

  describe('onlineCount computed', () => {
    it('should reflect length of onlineUsers', () => {
      fakeChatService.onlineUsers$.next([makeChatUser('a'), makeChatUser('b')]);
      expect(component.onlineCount()).toBe(2);
    });

    it('should return 0 when no online users', () => {
      fakeChatService.onlineUsers$.next([]);
      expect(component.onlineCount()).toBe(0);
    });
  });

  // ── computed: typingUserNames ─────────────────────────────────────────────

  describe('typingUserNames computed', () => {
    beforeEach(() => {
      component.profile.set(makeUser('user-1', 'Alice'));
      fakeChatService.onlineUsers$.next([
        makeChatUser('user-2', 'Bob'),
        makeChatUser('user-3', 'Carol'),
      ]);
    });

    it('should map typing user IDs to names', () => {
      fakeChatService.typingUsers$.next(['user-2']);
      expect(component.typingUserNames()).toContain('Bob');
    });

    it('should filter out the current user name', () => {
      fakeChatService.onlineUsers$.next([
        makeChatUser('user-1', 'Alice'),
        makeChatUser('user-2', 'Bob'),
      ]);
      fakeChatService.typingUsers$.next(['user-1', 'user-2']);
      expect(component.typingUserNames()).not.toContain('Alice');
      expect(component.typingUserNames()).toContain('Bob');
    });

    it('should fall back to "Someone" when user id not in onlineUsers', () => {
      fakeChatService.typingUsers$.next(['unknown-id']);
      const names = component.typingUserNames();
      expect(names[0]).toBeTruthy(); // returns fallback locale string
    });

    it('should return multiple names when multiple users are typing', () => {
      fakeChatService.typingUsers$.next(['user-2', 'user-3']);
      const names = component.typingUserNames();
      expect(names).toContain('Bob');
      expect(names).toContain('Carol');
    });
  });

  // ── onMessageInput ────────────────────────────────────────────────────────

  describe('onMessageInput', () => {
    it('should call chatService.startTyping after debounce when text is non-empty', fakeAsync(() => {
      component.profile.set(makeUser('user-1', 'Alice'));
      fakeChatService.isConnected$.next(true);
      component.onMessageInput('Hello');
      tick(300);
      expect(fakeChatService.startTyping).toHaveBeenCalledWith('user-1', 'Alice');
    }));

    it('should call chatService.stopTyping after debounce when text is empty', fakeAsync(() => {
      component.profile.set(makeUser('user-1', 'Alice'));
      component.onMessageInput('');
      tick(300);
      expect(fakeChatService.stopTyping).toHaveBeenCalledWith('user-1', 'Alice');
    }));

    it('should debounce multiple rapid inputs and only fire once', fakeAsync(() => {
      component.profile.set(makeUser('user-1', 'Alice'));
      component.onMessageInput('a');
      component.onMessageInput('ab');
      component.onMessageInput('abc');
      tick(300);
      expect(fakeChatService.startTyping).toHaveBeenCalledTimes(1);
    }));
  });

  // ── onMessageSent ─────────────────────────────────────────────────────────

  describe('onMessageSent', () => {
    beforeEach(() => {
      component.profile.set(makeUser('user-1', 'Alice'));
      fakeChatService.isConnected$.next(true);
    });

    it('should send a message and stop typing', () => {
      component.onMessageSent('Hello World');
      expect(fakeChatService.sendMessage).toHaveBeenCalledWith(
        'Hello World',
        ChatMessageType.TEXT,
        jasmine.objectContaining({ senderId: 'user-1', senderName: 'Alice' })
      );
      expect(fakeChatService.stopTyping).toHaveBeenCalledWith('user-1', 'Alice');
    });

    it('should not send when text is empty', () => {
      component.onMessageSent('');
      expect(fakeChatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send when not connected', () => {
      fakeChatService.isConnected$.next(false);
      component.onMessageSent('Hello');
      expect(fakeChatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send when profile is null', () => {
      component.profile.set(null);
      component.onMessageSent('Hello');
      expect(fakeChatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should include senderAvatar in sendMessage payload', () => {
      const userWithAvatar = { ...makeUser(), avatar: 'https://example.com/avatar.png' };
      component.profile.set(userWithAvatar);
      component.onMessageSent('Test');
      expect(fakeChatService.sendMessage).toHaveBeenCalledWith(
        'Test',
        ChatMessageType.TEXT,
        jasmine.objectContaining({ senderAvatar: 'https://example.com/avatar.png' })
      );
    });
  });

  // ── onReactionAdded ───────────────────────────────────────────────────────

  describe('onReactionAdded', () => {
    it('should call chatService.reactToMessage with correct args', () => {
      component.onReactionAdded({ messageId: 'msg-1', reaction: '👍' });
      expect(fakeChatService.reactToMessage).toHaveBeenCalledWith('msg-1', '👍');
    });
  });

  // ── loadMoreMessages ──────────────────────────────────────────────────────

  describe('loadMoreMessages', () => {
    it('should call chatService.loadMessageHistory(20)', () => {
      fakeChatService.loadMessageHistory.calls.reset();
      component.loadMoreMessages();
      expect(fakeChatService.loadMessageHistory).toHaveBeenCalledWith(20);
    });
  });

  // ── reconnectChat ─────────────────────────────────────────────────────────

  describe('reconnectChat', () => {
    it('should call chatService.joinChatRoom with current roomId', () => {
      component.profile.set(makeUser('user-1', 'Alice'));
      fakeChatService.joinChatRoom.calls.reset();
      component.reconnectChat();
      expect(fakeChatService.joinChatRoom).toHaveBeenCalledWith(
        'room-1', jasmine.any(String), 'user-1', 'Alice'
      );
    });

    it('should not call joinChatRoom when roomId is falsy', () => {
      (component as any).roomId = '';
      fakeChatService.joinChatRoom.calls.reset();
      component.reconnectChat();
      expect(fakeChatService.joinChatRoom).not.toHaveBeenCalled();
    });
  });

  // ── resetChatPosition ─────────────────────────────────────────────────────

  describe('resetChatPosition', () => {
    it('should emit resetPosition event', () => {
      let emitted = false;
      component.resetPosition.subscribe(() => (emitted = true));
      component.resetChatPosition();
      expect(emitted).toBeTrue();
    });
  });

  // ── ngOnDestroy ───────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call chatService.leaveChatRoom with profile id', () => {
      component.profile.set(makeUser('user-1'));
      component.ngOnDestroy();
      expect(fakeChatService.leaveChatRoom).toHaveBeenCalledWith('user-1');
    });

    it('should call leaveChatRoom with empty string when profile is null', () => {
      component.profile.set(null);
      component.ngOnDestroy();
      expect(fakeChatService.leaveChatRoom).toHaveBeenCalledWith('');
    });

    it('should remove the beforeunload event listener', () => {
      spyOn(window, 'removeEventListener');
      component.ngOnDestroy();
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'beforeunload', jasmine.any(Function)
      );
    });
  });

  // ── newMessage$ – scroll handling ─────────────────────────────────────────

  describe('newMessage$ handling', () => {
    it('should not throw when newMessage$ emits a message from a different user', () => {
      component.profile.set(makeUser('user-1'));
      expect(() => {
        fakeChatService.newMessage$.next(makeMessage({ senderId: 'user-2' }));
      }).not.toThrow();
    });

    it('should not throw when newMessage$ emits a message from self', () => {
      component.profile.set(makeUser('user-1'));
      expect(() => {
        fakeChatService.newMessage$.next(makeMessage({ senderId: 'user-1' }));
      }).not.toThrow();
    });
  });

  // ── isPanelExpanded ───────────────────────────────────────────────────────

  describe('isPanelExpanded', () => {
    it('should update isPanelExpanded to false via signal set', () => {
      component.isPanelExpanded.set(false);
      expect(component.isPanelExpanded()).toBeFalse();
    });

    it('should update isPanelExpanded to true via signal set', () => {
      component.isPanelExpanded.set(false);
      component.isPanelExpanded.set(true);
      expect(component.isPanelExpanded()).toBeTrue();
    });
  });
});
