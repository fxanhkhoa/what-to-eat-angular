import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { DishSectionComponent } from './dish-section.component';
import { DishService } from '@/app/service/dish.service';
import { LOCALE_ID } from '@angular/core';

describe('DishSectionComponent', () => {
  let component: DishSectionComponent;
  let fixture: ComponentFixture<DishSectionComponent>;
  let mockDishService: jasmine.SpyObj<DishService>;

  beforeEach(async () => {
    mockDishService = jasmine.createSpyObj('DishService', ['findRandom']);
    mockDishService.findRandom.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DishSectionComponent],
      providers: [
        { provide: DishService, useValue: mockDishService },
        { provide: LOCALE_ID, useValue: 'en-US' },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DishSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call DishService.findRandom on init', () => {
    expect(mockDishService.findRandom).toHaveBeenCalledWith(8, undefined);
  });
});
