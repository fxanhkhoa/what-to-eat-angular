import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './typing-indicator.component.html',
  styleUrls: ['./typing-indicator.component.scss'],
})
export class TypingIndicatorComponent {
  @Input() set typingUserNames(names: string[]) {
    this._typingUserNames.set(names);
  }

  private _typingUserNames = signal<string[]>([]);

  typingText = computed(() => {
    const names = this._typingUserNames();
    if (names.length === 0) return '';
    if (names.length === 1)
      return $localize`:@@voting-chat.one-typing:${names[0]} is typing...`;
    if (names.length === 2)
      return $localize`:@@voting-chat.two-typing:${names[0]} and ${names[1]} are typing...`;
    return $localize`:@@voting-chat.multiple-typing:${names.length} people are typing...`;
  });
}
