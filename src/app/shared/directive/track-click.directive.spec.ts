import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackClickDirective } from './track-click.directive';
import { WebsiteVisitService } from '@/app/service/website-visit.service';
import { of } from 'rxjs';

@Component({
  template: `
    <button [appTrackClick]="'explore_dish_btn'" [trackPath]="'/home'">Click Me</button>
  `,
  imports: [TrackClickDirective],
})
class TestHostComponent {}

describe('TrackClickDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let visitServiceSpy: jasmine.SpyObj<WebsiteVisitService>;

  beforeEach(() => {
    visitServiceSpy = jasmine.createSpyObj('WebsiteVisitService', ['trackClick']);
    visitServiceSpy.trackClick.and.returnValue(of(undefined as any));

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: WebsiteVisitService, useValue: visitServiceSpy }],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should call trackClick on host click', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(visitServiceSpy.trackClick).toHaveBeenCalledWith('explore_dish_btn', '/home');
  });
});

