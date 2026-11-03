import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatMessage } from '@/types/chat.type';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;
  @Input() isOwnMessage = false;
  @Input() availableReactions: string[] = [];

  @Output() reactionAdded = new EventEmitter<{
    messageId: string;
    reaction: string;
  }>();

  addReaction(reaction: string): void {
    this.reactionAdded.emit({
      messageId: this.message.id,
      reaction,
    });
  }

  getReactionCount(reaction: string): number {
    return this.message.reactions?.[reaction] || 0;
  }

  hasReacted(reaction: string): boolean {
    // Note: This is a simplified check. In a real app, you'd track which reactions are from the current user
    return this.getReactionCount(reaction) > 0;
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

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  hasReactionKeys(reactions: any): boolean {
    return reactions && Object.keys(reactions).length > 0;
  }
}
