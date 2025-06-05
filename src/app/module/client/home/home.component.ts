import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DishSectionComponent } from './dish-section/dish-section.component';
import { GameSectionComponent } from './game-section/game-section.component';
import { GameItem } from '@/types/game.type';

@Component({
  selector: 'app-home',
  imports: [
    MatButtonModule,
    MatIconModule,
    DishSectionComponent,
    GameSectionComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  gameSectionList: GameItem[] = [
    { imageUrl: '/images/wheel-of-fortune.jpg', text: 'Wheel Of Fortune' },
  ];

  constructor() {
    this.iconRegistry.addSvgIcon(
      'facebook',
      this.sanitizer.bypassSecurityTrustResourceUrl('/icons/facebook.svg')
    );

    this.iconRegistry.addSvgIcon(
      'tiktok',
      this.sanitizer.bypassSecurityTrustResourceUrl('/icons/tiktok.svg')
    );
  }
}
