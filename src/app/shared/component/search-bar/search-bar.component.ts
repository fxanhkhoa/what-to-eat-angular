import { isPlatformServer } from '@angular/common';
import { Component, EventEmitter, inject, Input, LOCALE_ID, Output, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search-bar',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  @Input() keyword: string = '';
  @Output() onResult = new EventEmitter<string>();

  localeID = inject(LOCALE_ID);
  private platform = inject(PLATFORM_ID);

  finalTranscript = this.keyword;
  recognizing = signal<boolean>(false);

  private recognition: any = null;

  constructor() {
    if (isPlatformServer(this.platform)) {
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.localeID;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.recognizing.set(true);
      };

      this.recognition.onend = () => {
        this.recognizing.set(false);
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.finalTranscript = transcript;
        this.search();
      };
    }
  }

  search() {
    this.onResult.emit(this.finalTranscript);
  }

  startSpeechRecognition() {
    if (this.recognition) {
      this.recognition.start();
    }
  }

  keyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search();
    }
  }
}
