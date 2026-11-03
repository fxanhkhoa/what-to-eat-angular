import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Services and Types
import { ChatSocketService } from '@/app/service/chat-socket.service';
import {
  ChatMessage,
  ChatMessageType,
  ChatRoomType,
  ChatUser,
} from '@/types/chat.type';
import { User } from '@/types/user.type';
import { AuthService } from '@/app/service/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '@/app/service/user.service';

// Sub-components
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { ChatMessageListComponent } from './chat-message-list/chat-message-list.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { TypingIndicatorComponent } from './typing-indicator/typing-indicator.component';
import { reactions } from '@/app/shared/constant/reactions.constant';

@Component({
  selector: 'app-voting-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    DragDropModule,
    ChatHeaderComponent,
    ChatMessageListComponent,
    ChatInputComponent,
    TypingIndicatorComponent,
  ],
  templateUrl: './voting-chat.component.html',
  styleUrls: ['./voting-chat.component.scss'],
})
export class VotingChatComponent implements OnInit, OnDestroy {
  @Input() roomId!: string;

  @Output() resetPosition = new EventEmitter<void>();

  @ViewChild(ChatMessageListComponent) private messageList!: ChatMessageListComponent;

  private authService = inject(AuthService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private userService = inject(UserService);

  private destroy$ = new Subject<void>();
  private typingSubject = new Subject<string>();

  // Reactive state
  isConnected = signal(false);
  connectionError = signal<string | null>(null);
  messages = signal<ChatMessage[]>([]);
  onlineUsers = signal<ChatUser[]>([]);
  typingUsers = signal<string[]>([]);
  profile = signal<User | null>(null);
  dragPosition = { x: 0, y: 0 };
  isPanelExpanded = signal(true);

  // Computed properties
  onlineCount = computed(() => this.onlineUsers().length);
  typingUserNames = computed(() => {
    const typing = this.typingUsers();
    const users = this.onlineUsers();
    return typing
      ? typing
          .map((id) => {
            const user = users.find((u) => u.id === id);
            return user?.name || $localize`:@@voting-chat.someone:Someone`;
          })
          .filter((name) => name !== this.profile()?.name)
      : [];
  });

  // Available reactions
  readonly availableReactions = reactions;

  constructor(private chatService: ChatSocketService) {
    this.iconRegistry.setDefaultFontSetClass(
      'material-symbols-outlined',
      'mat-ligature-font'
    );
    this.iconRegistry.addSvgIcon(
      'drag',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/drag.svg')
    );
  }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.setupTypingDebounce();
    this.setupBeforeUnloadHandler();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeBeforeUnloadHandler();
    this.chatService.leaveChatRoom(this.profile()?._id ?? '');
  }

  private initializeChat(): void {
    // Join the chat room for this voting session
    this.chatService.joinChatRoom(
      this.roomId,
      ChatRoomType.VOTE_GAME,
      this.profile()?._id ?? '',
      this.profile()?.name ?? ''
    );

    // Load recent message history
    setTimeout(() => {
      this.chatService.loadMessageHistory(20);
    }, 1000);
  }

  private setupSubscriptions(): void {
    // user profile
    this.authService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        this.profile.set(profile);
        this.initializeChat();
      });

    // Connection status
    this.chatService.isConnected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.isConnected.set(connected);
      });

    this.chatService.connectionError$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.connectionError.set(error);
      });

    // Messages
    this.chatService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages) => {
        this.messages.set(messages);
        this.messageList?.markForScroll();
      });

    // New message notification
    this.chatService.newMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        // Play notification sound or show notification
        if (
          this.profile() != null &&
          message.senderId !== this.profile()!._id
        ) {
          this.messageList?.markForScroll();
        }
      });

    // Online users
    this.chatService.onlineUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.onlineUsers.set(users);
        this.onlineUsers().forEach((user) => {
          if (!user.name) {
            this.userService.findOne(user.id).subscribe((res) => {
              user.name = res.name ?? '';
            });
          }
        });
      });

    // Typing indicators
    this.chatService.typingUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe((typing) => {
        this.typingUsers.set(typing);
      });
  }

  private setupTypingDebounce(): void {
    this.typingSubject
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe((text) => {
        if (text.trim()) {
          this.chatService.startTyping(
            this.profile()?._id ?? '',
            this.profile()?.name ?? ''
          );
        } else {
          this.chatService.stopTyping(
            this.profile()?._id ?? '',
            this.profile()?.name ?? ''
          );
        }
      });
  }

  private setupBeforeUnloadHandler(): void {
    // Handle browser/tab close or page refresh
    this.beforeUnloadHandler = () => {
      this.chatService.leaveChatRoom(this.profile()?._id ?? '');
    };
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private removeBeforeUnloadHandler(): void {
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  private beforeUnloadHandler: (() => void) | null = null;

  // Message handling
  onMessageInput(text: string): void {
    this.typingSubject.next(text);
  }

  onMessageSent(text: string): void {
    if (!text || !this.isConnected() || !this.profile()) return;

    this.chatService.sendMessage(text, ChatMessageType.TEXT, {
      senderId: this.profile()!._id,
      senderName: this.profile()!.name || 'Anonymous',
      senderAvatar: this.profile()!.avatar,
    });
    
    this.chatService.stopTyping(
      this.profile()?._id ?? '',
      this.profile()?.name ?? ''
    );
  }

  // Message reactions
  onReactionAdded(event: { messageId: string; reaction: string }): void {
    this.chatService.reactToMessage(event.messageId, event.reaction);
  }

  // UI helpers
  loadMoreMessages(): void {
    this.chatService.loadMessageHistory(20);
  }

  reconnectChat(): void {
    if (this.roomId) {
      this.chatService.joinChatRoom(
        this.roomId,
        ChatRoomType.VOTE_GAME,
        this.profile()?._id ?? '',
        this.profile()?.name ?? ''
      );
    }
  }

  /**
   * Request to reset the chat widget position
   */
  resetChatPosition(): void {
    this.resetPosition.emit();
  }
}
