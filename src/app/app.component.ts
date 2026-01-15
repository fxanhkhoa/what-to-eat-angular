import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from './service/auth.service';
import cookies from 'js-cookie';
import { isPlatformServer } from '@angular/common';
import { Cookies_Key } from '@/enum/cookies.enum';
import { WebsiteVisitService } from './service/website-visit.service';
import { FeedbackFabComponent } from './components/feedback-fab/feedback-fab.component';

@Component({
  selector: 'app-root',
  imports: [RouterModule, FeedbackFabComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private websiteVisitService = inject(WebsiteVisitService);

  title = 'what-to-eat-angular';

  ngOnInit(): void {
    this.refreshTokenAndInitialize();
    // Website visit tracking (unique per browser)
    if (!isPlatformServer(this.platformId)) {
      if (!localStorage.getItem('website_visited')) {
        this.websiteVisitService.trackVisit().subscribe((res) => {
          localStorage.setItem('website_visited', 'true');
        });
      }
      // Google Analytics route tracking
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

  refreshTokenAndInitialize() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const refreshToken = cookies.get(Cookies_Key.REFRESH_TOKEN);
    
    if (refreshToken) {
      // Refresh the access token if refresh token exists
      this.authService.refreshToken(refreshToken).subscribe({
        next: (tokenResult) => {
          // Save new tokens to cookies
          cookies.set(Cookies_Key.TOKEN, tokenResult.token, { expires: 7 });
          cookies.set(Cookies_Key.REFRESH_TOKEN, tokenResult.refreshToken, { expires: 30 });
          
          // Now get the profile with the refreshed token
          this.getProfile();
        },
        error: (error) => {
          console.error('Error refreshing token:', error);
          // Clear invalid tokens
          cookies.remove(Cookies_Key.TOKEN);
          cookies.remove(Cookies_Key.REFRESH_TOKEN);
        },
      });
    } else {
      // No refresh token, just try to get profile if access token exists
      this.getProfile();
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
