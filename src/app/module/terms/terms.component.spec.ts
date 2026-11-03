import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TermsComponent } from './terms.component';

describe('TermsComponent', () => {
  let component: TermsComponent;
  let fixture: ComponentFixture<TermsComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TermsComponent, NoopAnimationsModule],
      providers: [{ provide: Router, useValue: routerSpy }],
    })
      .overrideComponent(TermsComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(TermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ───────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── goBack ─────────────────────────────────────────────────────────────────────
  it('goBack should call window.history.back', () => {
    spyOn(window.history, 'back');
    component.goBack();
    expect(window.history.back).toHaveBeenCalled();
  });

  // ── goHome ─────────────────────────────────────────────────────────────────────
  it('goHome should navigate to /', () => {
    component.goHome();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
