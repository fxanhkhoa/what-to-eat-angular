import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

// Services and Types
import { ChatSocketService } from '@/app/service/chat-socket.service';
import {
  ChatMessage,
  ChatMessageType,
  ChatRoomType,
  ChatUser,
} from '@/types/chat.type';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { User } from '@/types/user.type';
import { AuthService } from '@/app/service/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '@/app/service/user.service';

@Component({
  selector: 'app-voting-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    MatBadgeModule,
    MatChipsModule,
    MatExpansionModule,
    DragDropModule,
  ],
  templateUrl: './voting-chat.component.html',
  styleUrls: ['./voting-chat.component.scss'],
})
export class VotingChatComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @Input() roomId!: string;

  @Output() resetPosition = new EventEmitter<void>();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  private authService = inject(AuthService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private userService = inject(UserService);

  private destroy$ = new Subject<void>();
  private typingSubject = new Subject<string>();
  private shouldScrollToBottom = true;
  // Reactive state
  messageText = signal('');
  isConnected = signal(false);
  connectionError = signal<string | null>(null);
  messages = signal<ChatMessage[]>([]);
  onlineUsers = signal<ChatUser[]>([]);
  typingUsers = signal<string[]>([]);
  isMinimized = signal(false);
  profile = signal<User | null>(null);
  dragPosition = { x: 0, y: 0 };
  isOnlineCountAnimating = signal(false);
  previousOnlineCount = signal(0);
  animationType = signal<'increase' | 'decrease' | 'none'>('none');

  // Computed properties
  onlineCount = computed(() => this.onlineUsers().length);
  typingUserNames = computed(() => {
    const typing = this.typingUsers();
    const users = this.onlineUsers();
    return typing
      ? typing
          .map((id) => {
            const user = users.find((u) => u.id === id);
            return user?.name || 'Someone';
          })
          .filter((name) => name !== this.profile()?.name)
      : [];
  });

  typingText = computed(() => {
    const names = this.typingUserNames();
    if (names.length === 0) return '';
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names.length} people are typing...`;
  });

  // Available reactions
  readonly availableReactions = [
    '👍',
    '👎',
    '❤️',
    '😄',
    '😮',
    '😢',
    '🎉',
    '🤔',
  ];

  constructor(private chatService: ChatSocketService) {
    this.iconRegistry.setDefaultFontSetClass(
      'material-symbols-outlined',
      'mat-ligature-font'
    );
    this.iconRegistry.addSvgIcon(
      'drag',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/drag.svg')
    );
    this.setupOnlineCountAnimation();
  }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.setupTypingDebounce();
    this.setupBeforeUnloadHandler();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
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
        this.shouldScrollToBottom = true;
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
          this.shouldScrollToBottom = true;
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
      .subscribe(() => {
        if (this.messageText().trim()) {
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

  private setupOnlineCountAnimation(): void {
    // Watch for changes in online count and trigger animation
    effect(() => {
      const currentCount = this.onlineCount();
      const previousCount = this.previousOnlineCount();

      if (currentCount !== previousCount) {
        // Determine animation type
        if (currentCount > previousCount) {
          this.animationType.set('increase');
        } else if (currentCount < previousCount) {
          this.animationType.set('decrease');
        }

        this.isOnlineCountAnimating.set(true);
        this.previousOnlineCount.set(currentCount);

        // Reset animation state after animation completes
        setTimeout(() => {
          this.isOnlineCountAnimating.set(false);
          this.animationType.set('none');
        }, 600); // Match the CSS animation duration
      }
    });
  }

  private beforeUnloadHandler: (() => void) | null = null;

  // Message handling
  onMessageInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const value = target?.value || '';
    this.messageText.set(value);
    this.typingSubject.next(value);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.messageText().trim();
    if (!text || !this.isConnected() || !this.profile()) return;

    this.chatService.sendMessage(text, ChatMessageType.TEXT, {
      senderId: this.profile()!._id,
      senderName: this.profile()!.name || 'Anonymous',
      senderAvatar: this.profile()!.avatar,
    });
    this.messageText.set('');
    this.chatService.stopTyping(
      this.profile()?._id ?? '',
      this.profile()?.name ?? ''
    );

    // Focus back to input
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 100);
  }

  // Message reactions
  addReaction(messageId: string, reaction: string): void {
    this.chatService.reactToMessage(messageId, reaction);
  }

  getReactionCount(message: ChatMessage, reaction: string): number {
    return message.reactions?.[reaction] || 0;
  }

  hasReacted(message: ChatMessage, reaction: string): boolean {
    // Note: This is a simplified check. In a real app, you'd track which reactions are from the current user
    return this.getReactionCount(message, reaction) > 0;
  }

  // UI helpers
  isOwnMessage(message: ChatMessage): boolean {
    if (!this.profile()) return false;
    return message.senderId === this.profile()!._id;
  }

  formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  }

  formatUserCount(count: number): string {
    if (count === 0) return 'No one online';
    if (count === 1) return '1 person online';
    return `${count} people online`;
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  hasReactionKeys(reactions: any): boolean {
    return reactions && Object.keys(reactions).length > 0;
  }

  toggleMinimize(): void {
    this.isMinimized.set(!this.isMinimized());
  }

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

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.warn('Could not scroll to bottom:', err);
    }
  }

  // Track by function for better performance
  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  trackByUserId(index: number, user: ChatUser): string {
    return user.id;
  }

  /**
   * Request to reset the chat widget position
   */
  resetChatPosition(): void {
    this.resetPosition.emit();
  }
}
