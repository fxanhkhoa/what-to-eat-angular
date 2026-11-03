import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { WebsiteVisitComponent } from './website-visit.component';
import { WebsiteVisitService } from '@/app/service/website-visit.service';
import { APIPagination } from '@/types/base.type';
import { WebsiteVisit } from '@/types/website_visit.type';
import { PageEvent } from '@angular/material/paginator';

describe('WebsiteVisitComponent', () => {
  let component: WebsiteVisitComponent;
  let fixture: ComponentFixture<WebsiteVisitComponent>;
  let websiteVisitServiceSpy: jasmine.SpyObj<WebsiteVisitService>;

  const visitMock: WebsiteVisit = {
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    visitedAt: new Date('2026-01-01T10:00:00.000Z'),
  };

  const visitsResponse: APIPagination<WebsiteVisit> = {
    data: [visitMock],
    count: 1,
  };

  beforeEach(async () => {
    websiteVisitServiceSpy = jasmine.createSpyObj<WebsiteVisitService>(
      'WebsiteVisitService',
      ['findAll', 'getVisitCount']
    );

    websiteVisitServiceSpy.findAll.and.returnValue(of(visitsResponse));
    websiteVisitServiceSpy.getVisitCount.and.returnValue(of({ count: 42 }));

    await TestBed.configureTestingModule({
      imports: [WebsiteVisitComponent],
      providers: [
        { provide: WebsiteVisitService, useValue: websiteVisitServiceSpy },
      ],
    })
      // Keep this test focused on component behavior and service interactions.
      .overrideComponent(WebsiteVisitComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(WebsiteVisitComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load visits and count on init', () => {
    fixture.detectChanges();

    expect(websiteVisitServiceSpy.findAll).toHaveBeenCalledWith(1, 10);
    expect(websiteVisitServiceSpy.getVisitCount).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual([visitMock]);
    expect(component.totalItems).toBe(1);
    expect(component.visitCount).toBe(42);
    expect(component.isLoading).toBeFalse();
    expect(component.isLoadingPage).toBeFalse();
  });

  it('should set initial loading state before first load emits', () => {
    websiteVisitServiceSpy.findAll.and.returnValue(of(visitsResponse));

    component.dataSource.data = [];
    component.loadVisits(1, 10);

    expect(component.isLoading).toBeFalse();
    expect(component.isLoadingPage).toBeFalse();
  });

  it('should set paging loading path when loading non-initial page', () => {
    component.dataSource.data = [visitMock];

    component.loadVisits(2, 10);

    expect(websiteVisitServiceSpy.findAll).toHaveBeenCalledWith(2, 10);
    expect(component.isLoading).toBeFalse();
    expect(component.isLoadingPage).toBeFalse();
  });

  it('should clear loading flags on visits load error', () => {
    spyOn(console, 'error');
    websiteVisitServiceSpy.findAll.and.returnValue(
      throwError(() => new Error('load error'))
    );

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.isLoadingPage).toBeFalse();
  });

  it('should update page and limit on page change', () => {
    const loadVisitsSpy = spyOn(component, 'loadVisits');
    const event: PageEvent = {
      length: 100,
      pageIndex: 2,
      pageSize: 25,
      previousPageIndex: 1,
    };

    component.onPageChange(event);

    expect(component.page).toBe(3);
    expect(component.limit).toBe(25);
    expect(component.isLoadingPage).toBeTrue();
    expect(loadVisitsSpy).toHaveBeenCalledWith(3, 25);
  });

  it('should refresh visits and count', () => {
    const loadVisitsSpy = spyOn(component, 'loadVisits');
    const loadVisitCountSpy = spyOn(component, 'loadVisitCount');

    component.refresh();

    expect(loadVisitsSpy).toHaveBeenCalled();
    expect(loadVisitCountSpy).toHaveBeenCalled();
  });

  it('should keep visitCount null when count request fails', () => {
    spyOn(console, 'error');
    websiteVisitServiceSpy.getVisitCount.and.returnValue(
      throwError(() => new Error('count error'))
    );

    component.loadVisitCount();

    expect(console.error).toHaveBeenCalled();
    expect(component.visitCount).toBeNull();
  });

  it('should build stable trackBy key from ip and visitedAt', () => {
    const result = component.trackByVisitId(0, visitMock);

    expect(result).toBe(`127.0.0.1-${visitMock.visitedAt.getTime()}`);
  });

  it('should sort table data by ip in ascending order', () => {
    const newerVisit: WebsiteVisit = {
      ip: '192.168.1.10',
      userAgent: 'Chrome',
      visitedAt: new Date('2026-01-03T10:00:00.000Z'),
    };
    const olderVisit: WebsiteVisit = {
      ip: '10.0.0.2',
      userAgent: 'Firefox',
      visitedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    component.dataSource.data = [newerVisit, olderVisit];

    const sorted = component.dataSource.sortData(component.dataSource.data, {
      active: 'ip',
      direction: 'asc',
    } as any);

    expect(sorted.map((visit) => visit.ip)).toEqual(['10.0.0.2', '192.168.1.10']);
  });
});
