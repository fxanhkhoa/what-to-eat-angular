import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-voting-create-update',
  imports: [RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './voting-create-update.component.html',
  styleUrl: './voting-create-update.component.scss',
})
export class VotingCreateUpdateComponent {
  goBack() {
    window.history.back();
  }
}
