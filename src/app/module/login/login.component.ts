import { AuthService } from '@/app/service/auth.service';
import { Cookies_Key } from '@/enum/cookies.enum';
import { Component, inject } from '@angular/core';
import { signInWithPopup, Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import cookies from 'js-cookie';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private router = inject(Router);

  async loginWithGoogle() {
    const userCredential = await signInWithPopup(
      this.auth,
      new GoogleAuthProvider()
    );
    const idToken = await userCredential.user.getIdToken();
    this.authService.login(idToken).subscribe((res) => {
      if (res) {
        cookies.set(Cookies_Key.TOKEN, res.token);
        cookies.set(Cookies_Key.REFRESH_TOKEN, res.refreshToken);

        this.router.navigate(['/']);
      }
    });
  }
}
