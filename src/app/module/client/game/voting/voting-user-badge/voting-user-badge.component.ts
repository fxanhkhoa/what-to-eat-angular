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
    this.colors[this.hashString(this.voterName) % this.colors.length]
  );

  private hashString(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
