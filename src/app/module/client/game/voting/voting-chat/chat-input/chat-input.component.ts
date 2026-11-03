import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    TextFieldModule,
  ],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss'],
})
export class ChatInputComponent {
  @Input() isConnected = false;

  @Output() messageSent = new EventEmitter<string>();
  @Output() messageInput = new EventEmitter<string>();

  @ViewChild('messageInputField') private messageInputField!: ElementRef;

  messageText = signal('');

  onMessageInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const value = target?.value || '';
    this.messageText.set(value);
    this.messageInput.emit(value);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.messageText().trim();
    if (!text || !this.isConnected) return;

    this.messageSent.emit(text);
    this.messageText.set('');

    // Focus back to input
    setTimeout(() => {
      this.messageInputField?.nativeElement?.focus();
    }, 100);
  }
}
