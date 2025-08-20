import { JWTTokenPayload } from '@/types/auth.type';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  Renderer2,
  DOCUMENT,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { jwtDecode } from 'jwt-decode';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { AuthService } from '@/app/service/auth.service';
import { ToastService } from '@/app/shared/service/toast.service';

@Component({
  selector: 'app-admin',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterModule,
    BreadcrumbComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  payload?: JWTTokenPayload;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  ngOnInit(): void {
    this.renderer.removeClass(this.document.body, 'dark-theme');

    const token = cookies.get(Cookies_Key.TOKEN);

    if (token) {
      this.payload = jwtDecode<JWTTokenPayload>(token ?? '');
    }
  }

  logout() {
    const refreshToken = cookies.get(Cookies_Key.REFRESH_TOKEN);
    if (!refreshToken) {
      this.toastService.showError(
        $localize`Failed`,
        $localize`Can not log out`,
        1500
      );
      return;
    }
    this.authService.logout(refreshToken).subscribe({
      next: () => {
        // Clear authentication tokens
        cookies.remove(Cookies_Key.TOKEN);
        cookies.remove(Cookies_Key.REFRESH_TOKEN);

        // Clear user payload and permissions
        this.payload = undefined;

        // Navigate to login page
        window.location.reload();
      },
      error: (error) => {
        console.error('Logout failed', error);
      },
    });
  }
}
