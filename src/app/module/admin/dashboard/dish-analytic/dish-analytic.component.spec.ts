import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

import { DishAnalyticComponent } from './dish-analytic.component';
import { DishService } from '@/app/service/dish.service';
import { DishAnalyze } from '@/types/dish-analyze.type';

describe('DishAnalyticComponent', () => {
  let component: DishAnalyticComponent;
  let fixture: ComponentFixture<DishAnalyticComponent>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;

  const analyzeMock: DishAnalyze = {
    avgTimes: [
      {
        _id: null,
        avgCookingTime: 12.6,
        avgPreparationTime: 7.4,
      },
    ],
    categoryDistribution: [
      { _id: 'Dinner', count: 2 },
      { _id: 'Breakfast', count: 5 },
      { _id: 'Lunch', count: 3 },
    ],
    difficultyLevels: [
      { _id: 'Easy', count: 4 },
      { _id: 'Hard', count: 1 },
    ],
  };

  async function setup(platformId: 'browser' | 'server' = 'browser') {
    dishServiceSpy = jasmine.createSpyObj<DishService>('DishService', [
      'analyze',
    ]);
    dishServiceSpy.analyze.and.returnValue(of(analyzeMock));

    await TestBed.configureTestingModule({
      imports: [DishAnalyticComponent],
      providers: [
        { provide: DishService, useValue: dishServiceSpy },
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    })
      // Keep this unit test focused on transformation logic.
      .overrideComponent(DishAnalyticComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(DishAnalyticComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await setup();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call analyze and map dashboard data on browser init', () => {
    fixture.detectChanges();

    expect(dishServiceSpy.analyze).toHaveBeenCalled();
    expect(component.dishAnalyze).toEqual(analyzeMock);
    expect(component.categoryData).toEqual([
      { name: 'Breakfast', value: 5 },
      { name: 'Lunch', value: 3 },
      { name: 'Dinner', value: 2 },
    ]);
    expect(component.difficultyData).toEqual([
      { name: 'Easy', value: 4 },
      { name: 'Hard', value: 1 },
    ]);
    expect(component.avgCookingTime).toBe(13);
    expect(component.avgPreparationTime).toBe(7);
  });

  it('should keep average times at default when avgTimes is empty', async () => {
    const noAvgTimesMock: DishAnalyze = {
      ...analyzeMock,
      avgTimes: [],
    };
    dishServiceSpy.analyze.and.returnValue(of(noAvgTimesMock));

    fixture.detectChanges();

    expect(component.avgCookingTime).toBe(0);
    expect(component.avgPreparationTime).toBe(0);
  });

  it('should not call analyze when running on server platform', () => {
    dishServiceSpy.analyze.calls.reset();

    // Simulate SSR path without re-configuring TestBed after instantiation.
    (component as any).platformId = 'server';
    component.ngOnInit();

    expect(dishServiceSpy.analyze).not.toHaveBeenCalled();
    expect(component.dishAnalyze).toBeUndefined();
    expect(component.categoryData).toEqual([]);
    expect(component.difficultyData).toEqual([]);
  });
});
