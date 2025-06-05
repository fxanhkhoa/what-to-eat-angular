import { GameItem } from '@/types/game.type';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game-section',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './game-section.component.html',
  styleUrl: './game-section.component.scss',
})
export class GameSectionComponent {
  slides = [
    {
      id: 1,
      image: 'https://picsum.photos/1200/600',
      title: 'Breathtaking Nature',
      description:
        'Discover the beauty of untouched landscapes and natural wonders across the globe.',
    },
    {
      id: 2,
      image: 'https://picsum.photos/1200/600',
      title: 'Modern Architecture',
      description:
        'Explore innovative designs and stunning structures that define contemporary skylines.',
    },
    {
      id: 3,
      image: 'https://picsum.photos/1200/600',
      title: 'Wanderlust Adventures',
      description:
        'Embark on a journey through exotic destinations and cultural experiences.',
    },
    {
      id: 4,
      image: 'https://picsum.photos/1200/600',
      title: 'Future Technology',
      description:
        'Glimpse into tomorrow with cutting-edge innovations that are changing our world.',
    },
  ];

  currentSlide = 0;

  // Previous slide
  onPreviousClick() {
    const previous = this.currentSlide - 1;
    this.currentSlide = previous < 0 ? this.slides.length - 1 : previous;
  }

  // Next slide
  onNextClick() {
    const next = this.currentSlide + 1;
    this.currentSlide = next === this.slides.length ? 0 : next;
  }

  // Go to a specific slide
  goToSlide(index: number) {
    this.currentSlide = index;
  }
}
