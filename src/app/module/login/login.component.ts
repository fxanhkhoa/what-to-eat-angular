import { AuthService } from '@/app/service/auth.service';
import { Cookies_Key } from '@/enum/cookies.enum';
import { JWTTokenPayload } from '@/types/auth.type';
import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { signInWithPopup, Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  imports: [MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject<string>(PLATFORM_ID);

  ngOnInit(): void {
    this.navigate();
  }

  async loginWithGoogle() {
    const userCredential = await signInWithPopup(
      this.auth,
      new GoogleAuthProvider()
    );
    const idToken = await userCredential.user.getIdToken();
    this.authService.login(idToken).subscribe((res) => {
      if (res) {
        // Decode the token to get expiration time
        const decoded = jwtDecode<JWTTokenPayload>(res.token);
        const expirationDate = new Date(decoded.exp * 1000); // Convert Unix timestamp to Date

        const refreshDecoded = jwtDecode<JWTTokenPayload>(res.refreshToken);
        const expirationRefreshDate = new Date(refreshDecoded.exp * 1000); // Convert Unix timestamp to Date

        // Set cookies with expiration based on JWT token
        cookies.set(Cookies_Key.TOKEN, res.token, { expires: expirationDate });
        cookies.set(Cookies_Key.REFRESH_TOKEN, res.refreshToken, { expires: expirationRefreshDate });

        this.navigate();
      }
    });
  }

  navigate() {
    const isRunningInBrowser = isPlatformBrowser(this.platformId);

    if (!isRunningInBrowser) return;
    const token = cookies.get(Cookies_Key.TOKEN);
    if (!token) return;
    
    // Get redirect URL from query parameters
    const redirectUrl = this.route.snapshot.queryParams['redirect'];
    
    if (redirectUrl) {
      // If there's a redirect URL, navigate to it
      this.router.navigateByUrl(decodeURIComponent(redirectUrl));
      return;
    }

    // Default navigation based on user role
    const decoded = jwtDecode<JWTTokenPayload>(token ?? '');
    if (decoded.role_name === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
