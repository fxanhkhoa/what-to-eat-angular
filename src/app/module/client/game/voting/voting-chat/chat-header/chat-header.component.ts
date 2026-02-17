import { Component, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss'],
})
export class ChatHeaderComponent {
  @Input() set onlineCount(count: number) {
    this._onlineCount.set(count);
  }
  @Input() set isConnected(connected: boolean) {
    this._isConnected.set(connected);
  }
  @Input() set connectionError(error: string | null) {
    this._connectionError.set(error);
  }

  @Output() reconnect = new EventEmitter<void>();

  _onlineCount = signal(0);
  _isConnected = signal(false);
  _connectionError = signal<string | null>(null);

  isOnlineCountAnimating = signal(false);
  previousOnlineCount = signal(0);
  animationType = signal<'increase' | 'decrease' | 'none'>('none');

  constructor() {
    this.setupOnlineCountAnimation();
  }

  private setupOnlineCountAnimation(): void {
    // Watch for changes in online count and trigger animation
    effect(() => {
      const currentCount = this._onlineCount();
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

  formatUserCount(count: number): string {
    if (count === 0) return $localize`:@@voting-chat.no-one-online:No one online`;
    if (count === 1) return $localize`:@@voting-chat.one-person-online:1 person online`;
    return $localize`:@@voting-chat.multiple-people-online:${count} people online`;
  }

  onReconnect(): void {
    this.reconnect.emit();
  }
}
