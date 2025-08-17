import { COLOR_PALETTE } from '@/constant/color.constant';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-voting-user-badge',
  imports: [CommonModule],
  templateUrl: './voting-user-badge.component.html',
  styleUrl: './voting-user-badge.component.scss',
})
export class VotingUserBadgeComponent implements OnInit {
  @Input() voterName: string = '';
  @Input() index: number = 0;
  colors = COLOR_PALETTE.slice(0, 9);

  randomColor = signal(this.colors[this.index % this.colors.length]);

  ngOnInit() {
    this.randomColor.set(this.colors[this.index % this.colors.length]);
  }
}
