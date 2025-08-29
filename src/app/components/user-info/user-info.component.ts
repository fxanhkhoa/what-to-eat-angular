import { UserService } from '@/app/service/user.service';
import { User } from '@/types/user.type';
import { Component, inject, Input, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-user-info',
  imports: [],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit {
  @Input() userId!: string;
  @Input() showingKeys!: (keyof User)[];

  private userService = inject(UserService);

  info = signal<string>('');

  ngOnInit() {
    this.userService.findOne(this.userId).subscribe((userInfo) => {
      for (const key of this.showingKeys) {
        if (userInfo[key]) {
          this.info.set(this.info() + userInfo[key] + ' ');
        }
      }
    });
  }
}
