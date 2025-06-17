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
      image: '/images/wheel-of-fortune.png',
      title: 'Food Wheel Of Fortune',
      description:
        'This exciting and interactive game is designed to banish indecision and inject some fun into your dining choices. Simply spin the wheel, and let fate (and a dash of delicious randomness) pick your next meal.',
    },
    {
      id: 2,
      image: '/images/flipping-card-game.png',
      title: `Foodie Flip: What's for Dinner?`,
      description: `Get ready to rumble... or rather, to munch! Foodie Flip: What's for Dinner? is the deliciously simple card-flipping game where your memory and a bit of luck decide your next meal. Players will reveal a spread of face-down cards, each hiding a mouth-watering food item. Your goal? To remember where each delectable dish is. But here's the twist: the very last card you successfully flip is the dish that's "chosen to be eaten"! Whether it's a cheesy pizza, a sizzling steak, or a decadent dessert, the pressure is on to find the perfect last flip. Perfect for all ages, Foodie Flip is a quick, engaging game that promises laughs, a little bit of strategy, and a whole lot of hunger-inducing fun!`,
    },
    {
      id: 3,
      image: '/images/voting-game.png',
      title: 'Voting Game',
      description: `Welcome to Food Fight: The Ultimate Feast! – the deliciously democratic voting game where every player gets a say in what's for dinner! Forget boring menus and endless debates; in this game, a smorgasbord of delectable dishes is laid out before you. Each round, players cast their votes for their favorite food item, from exotic culinary creations to comforting classics. The dish that garners the most votes wins, and that's what we'll be "eating" (or at least celebrating!) this round! Strategize, persuade, and maybe even bluff your way to your favorite meal. Will it be a spicy taco night, a cheesy pizza party, or a decadent dessert extravaganza? Only the votes will tell! Food Fight: The Ultimate Feast! is a fun, lighthearted game perfect for friends and family who love food and a good-natured competition.`,
    },
  ];

  currentSlide = 1;

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
