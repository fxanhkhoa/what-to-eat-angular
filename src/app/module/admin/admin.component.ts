import { JWTTokenPayload } from '@/types/auth.type';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, Renderer2, DOCUMENT } from '@angular/core';
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
import { BreadcrumbService } from '@/app/service/breadcrumb.service';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

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
    cookies.remove(Cookies_Key.TOKEN);
    cookies.remove(Cookies_Key.REFRESH_TOKEN);
    window.location.reload();
  }
}
