import { COLOR_PALETTE } from '@/constant/color.constant';
import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-voting-user-badge',
  imports: [CommonModule],
  templateUrl: './voting-user-badge.component.html',
  styleUrl: './voting-user-badge.component.scss',
})
export class VotingUserBadgeComponent {
  @Input() voterName: string = '';
  colors = COLOR_PALETTE.slice(0, 9);

  randomColor = signal(
    this.colors[Math.floor(Math.random() * this.colors.length)]
  );
}
