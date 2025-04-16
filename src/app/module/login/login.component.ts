import { AuthService } from '@/app/service/auth.service';
import { Cookies_Key } from '@/enum/cookies.enum';
import { JWTTokenPayload } from '@/types/auth.type';
import { Component, inject, OnInit } from '@angular/core';
import { signInWithPopup, Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const token = cookies.get(Cookies_Key.TOKEN);
    if (!token) this.router.navigate(['/login']);

    const decoded = jwtDecode<JWTTokenPayload>(token ?? '');

    if (decoded.role_name === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }

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
