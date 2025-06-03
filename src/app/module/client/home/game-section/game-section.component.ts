import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type GameItem = {
  imageUrl: string;
  text: string;
};

@Component({
  selector: 'app-game-section',
  imports: [CommonModule],
  templateUrl: './game-section.component.html',
  styleUrl: './game-section.component.scss',
})
export class GameSectionComponent {
  @Input() items: GameItem[] = [];
  currentIndex = 0;

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
  }

  prev(): void {
    this.currentIndex =
      this.currentIndex === 0 ? this.items.length - 1 : this.currentIndex - 1;
  }
}
