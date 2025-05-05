import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client',
  imports: [RouterModule, CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit {
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);

  isMenuOpen = false;

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'dark-theme');
    this.renderer.addClass(this.document.body, 'client-body');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
