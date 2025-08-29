import { UserService } from '@/app/service/user.service';
import { isObjectId } from '@/app/shared/util/mongo.util';
import { COLOR_PALETTE } from '@/constant/color.constant';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-voting-user-badge',
  imports: [CommonModule],
  templateUrl: './voting-user-badge.component.html',
  styleUrl: './voting-user-badge.component.scss',
})
export class VotingUserBadgeComponent implements OnInit {
  @Input() voterName: string = '';
  @Input() index: number = 0;

  private userService = inject(UserService);

  colors = COLOR_PALETTE.slice(0, 9);
  randomColor = signal(this.colors[this.index % this.colors.length]);
  name = signal(this.voterName);

  ngOnInit() {
    this.randomColor.set(this.colors[this.index % this.colors.length]);
    if (isObjectId(this.voterName)) {
      this.getUserById(this.voterName);
    }
  }

  getUserById(id: string) {
    this.userService.findOne(id).subscribe({
      next: (user) => {
        this.name.set(user.name ?? $localize`Anonymous`);
      },
    });
  }
}
