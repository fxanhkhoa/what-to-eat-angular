import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatMessage } from '@/types/chat.type';
import { ChatMessageComponent } from '../chat-message/chat-message.component';

@Component({
  selector: 'app-chat-message-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ChatMessageComponent],
  templateUrl: './chat-message-list.component.html',
  styleUrls: ['./chat-message-list.component.scss'],
})
export class ChatMessageListComponent implements AfterViewChecked {
  @Input() messages: ChatMessage[] = [];
  @Input() isConnected = false;
  @Input() currentUserId: string | null = null;
  @Input() availableReactions: string[] = [];

  @Output() reactionAdded = new EventEmitter<{
    messageId: string;
    reaction: string;
  }>();
  @Output() loadMore = new EventEmitter<void>();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private shouldScrollToBottom = true;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  isOwnMessage(message: ChatMessage): boolean {
    if (!this.currentUserId) return false;
    return message.senderId === this.currentUserId;
  }

  onReactionAdded(event: { messageId: string; reaction: string }): void {
    this.reactionAdded.emit(event);
  }

  onLoadMore(): void {
    this.loadMore.emit();
  }

  markForScroll(): void {
    this.shouldScrollToBottom = true;
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.warn('Could not scroll to bottom:', err);
    }
  }

  // Track by function for better performance
  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}
