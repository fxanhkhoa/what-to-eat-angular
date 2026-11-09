import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTrackingComponent } from './admin-tracking.component';
import { WebsiteVisitService } from '@/app/service/website-visit.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { WebsiteVisitAnalytics } from '@/types/website_visit.type';

describe('AdminTrackingComponent', () => {
  let component: AdminTrackingComponent;
  let fixture: ComponentFixture<AdminTrackingComponent>;
  let visitServiceSpy: jasmine.SpyObj<WebsiteVisitService>;

  const mockAnalytics: WebsiteVisitAnalytics = {
    totalVisits: 150,
    totalClicks: 45,
    uniqueVisitors: 80,
    todayVisits: 12,
    todayClicks: 4,
    visitsByCountry: [
      { name: 'Vietnam', value: 100, code: 'VN' },
      { name: 'United States', value: 30, code: 'US' },
    ],
    visitsByCity: [{ name: 'Ho Chi Minh City', value: 75 }],
    visitsByDevice: [
      { name: 'Desktop', value: 90 },
      { name: 'Mobile', value: 60 },
    ],
    visitsByBrowser: [{ name: 'Chrome', value: 110 }],
    visitsByOS: [{ name: 'macOS', value: 80 }],
    visitsOverTime: [{ name: '2026-11-01', value: 20 }],
    topPages: [{ name: '/dish', value: 50 }],
    topClicks: [{ name: 'wheel_spin', value: 15 }],
  };

  const mockVisits = {
    data: [
      {
        ip: '1.2.3.4',
        country: 'Vietnam',
        countryCode: 'VN',
        city: 'Ho Chi Minh City',
        action: 'visit',
        path: '/dish',
        device: 'Desktop',
        browser: 'Chrome',
        userAgent: 'Chrome',
        visitedAt: new Date(),
      },
    ],
    count: 1,
  };

  beforeEach(async () => {
    visitServiceSpy = jasmine.createSpyObj('WebsiteVisitService', [
      'getAnalytics',
      'findAll',
    ]);
    visitServiceSpy.getAnalytics.and.returnValue(of(mockAnalytics));
    visitServiceSpy.findAll.and.returnValue(of(mockVisits));

    await TestBed.configureTestingModule({
      imports: [AdminTrackingComponent],
      providers: [
        { provide: WebsiteVisitService, useValue: visitServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load analytics and logs on init', () => {
    expect(component).toBeTruthy();
    expect(visitServiceSpy.getAnalytics).toHaveBeenCalledWith(30);
    expect(visitServiceSpy.findAll).toHaveBeenCalled();
    expect(component.analytics).toEqual(mockAnalytics);
    expect(component.dataSource.data.length).toBe(1);
    expect(component.totalLogs).toBe(1);
  });

  it('should handle analytics load error gracefully', () => {
    visitServiceSpy.getAnalytics.and.returnValue(throwError(() => new Error('API error')));
    component.loadAnalytics();
    expect(component.isLoadingAnalytics).toBeFalse();
  });

  it('should handle logs load error gracefully', () => {
    visitServiceSpy.findAll.and.returnValue(throwError(() => new Error('API error')));
    component.loadLogs();
    expect(component.isLoadingTable).toBeFalse();
  });

  it('should change days and reload data', () => {
    component.onDaysChange(7);
    expect(component.selectedDays).toBe(7);
    expect(component.page).toBe(1);
    expect(visitServiceSpy.getAnalytics).toHaveBeenCalledWith(7);
  });

  it('should filter logs when country is selected in chart (click event)', () => {
    component.onCountrySelect({ name: 'Vietnam' });
    expect(component.selectedCountryFilter).toBe('Vietnam');
    expect(component.page).toBe(1);
    expect(visitServiceSpy.findAll).toHaveBeenCalledWith(
      1,
      10,
      jasmine.objectContaining({ country: 'Vietnam' })
    );
  });

  it('should clear country filter', () => {
    component.selectedCountryFilter = 'Vietnam';
    component.clearCountryFilter();
    expect(component.selectedCountryFilter).toBe('');
    expect(visitServiceSpy.findAll).toHaveBeenCalled();
  });

  it('should set action filter', () => {
    component.setActionFilter('click');
    expect(component.selectedActionFilter).toBe('click');
    expect(visitServiceSpy.findAll).toHaveBeenCalledWith(
      1,
      10,
      jasmine.objectContaining({ action: 'click' })
    );
  });

  it('should update on search', () => {
    component.searchQuery = '1.2.3.4';
    component.onSearch();
    expect(visitServiceSpy.findAll).toHaveBeenCalledWith(
      1,
      10,
      jasmine.objectContaining({ search: '1.2.3.4' })
    );
  });

  it('should handle page change', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 25, length: 100 });
    expect(component.page).toBe(2);
    expect(component.limit).toBe(25);
    expect(visitServiceSpy.findAll).toHaveBeenCalledWith(2, 25, jasmine.any(Object));
  });

  it('should return flag emoji or fallback for country code', () => {
    expect(component.getCountryFlag('VN')).toBeTruthy();
    expect(component.getCountryFlag('US')).toBeTruthy();
    expect(component.getCountryFlag('UN')).toBe('🌐');
    expect(component.getCountryFlag('')).toBe('🌐');
  });

  it('should return appropriate device icon', () => {
    expect(component.getDeviceIcon('Mobile')).toBe('smartphone');
    expect(component.getDeviceIcon('Tablet')).toBe('tablet');
    expect(component.getDeviceIcon('Desktop')).toBe('laptop');
    expect(component.getDeviceIcon(undefined)).toBe('laptop');
  });
});

