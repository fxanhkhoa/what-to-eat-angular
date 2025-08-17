import { Component, inject, OnInit, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@/app/service/auth.service';
import { Cookies_Key } from '@/enum/cookies.enum';
import { JWTTokenPayload } from '@/types/auth.type';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-login',
  imports: [MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject<string>(PLATFORM_ID);
  private ngZone = inject(NgZone);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ensureGoogleScriptLoaded().then(() => {
        this.renderGoogleButton();
        this.initGoogleOneTap();
      });
    }
    this.navigate();
  }

  // Ensures the Google Sign-In script is loaded before using it
  ensureGoogleScriptLoaded(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).google && (window as any).google.accounts) {
        resolve();
        return;
      }
      const scriptId = 'google-signin-client';
      if (document.getElementById(scriptId)) {
        // If script is already being loaded, wait for it to finish
        (document.getElementById(scriptId) as HTMLScriptElement).addEventListener('load', () => resolve());
        return;
      }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  // Renders the Google Sign-In button
  renderGoogleButton() {
    // Replace with your Google OAuth Client ID
    const clientId = environment.GOOGLE_CLIENT_ID;
    if (
      (window as any).google &&
      document.getElementById('google-signin-btn')
    ) {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => this.handleCredentialResponse(response),
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: 300 }
      );
    }
  }

  // Initializes Google One Tap prompt
  initGoogleOneTap() {
    const clientId = environment.GOOGLE_CLIENT_ID;
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: false,
      });
      (window as any).google.accounts.id.prompt();
    }
  }

  // Handles Google credential response
  handleCredentialResponse(response: any) {
    const credential = response.credential;
    if (!credential) {
      console.error('No credential received from Google');
      return;
    }
    this.authService.login(credential).subscribe((res) => {
      if (res) {
        const decoded = jwtDecode<JWTTokenPayload>(res.token);
        const expirationDate = new Date(decoded.exp * 1000);
        const refreshDecoded = jwtDecode<JWTTokenPayload>(res.refreshToken);
        const expirationRefreshDate = new Date(refreshDecoded.exp * 1000);
        cookies.set(Cookies_Key.TOKEN, res.token, { expires: expirationDate });
        cookies.set(Cookies_Key.REFRESH_TOKEN, res.refreshToken, {
          expires: expirationRefreshDate,
        });
        this.ngZone.run(() => this.navigate());
      }
    });
  }

  // Handles navigation after login
  navigate() {
    const isRunningInBrowser = isPlatformBrowser(this.platformId);
    if (!isRunningInBrowser) return;
    const token = cookies.get(Cookies_Key.TOKEN);
    if (!token) return;
    const redirectUrl = this.route.snapshot.queryParams['redirect'];
    if (redirectUrl) {
      this.router.navigateByUrl(decodeURIComponent(redirectUrl));
      return;
    }
    const decoded = jwtDecode<JWTTokenPayload>(token ?? '');
    if (decoded.role_name === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
