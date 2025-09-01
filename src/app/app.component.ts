import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from './service/auth.service';
import cookies from 'js-cookie';
import { isPlatformServer } from '@angular/common';
import { Cookies_Key } from '@/enum/cookies.enum';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  title = 'what-to-eat-angular';

  ngOnInit(): void {
    this.getProfile();
    // Google Analytics route tracking
    if (!isPlatformServer(this.platformId)) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
            if (typeof window.gtag === 'function') {
                window.gtag('config', 'G-FWE0TE8LCZ', {
              page_path: event.urlAfterRedirects,
            });
          }
        }
      });
    }
  }

  getProfile() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    const token = cookies.get(Cookies_Key.TOKEN);
    if (!token) {
      return;
    }
    this.authService.getProfileAPI().subscribe({
      next: (profile) => {
        this.authService.setProfile(profile);
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      },
    });
  }
}
