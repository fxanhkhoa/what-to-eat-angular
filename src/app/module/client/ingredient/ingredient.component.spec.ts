import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PageEvent } from '@angular/material/paginator';
import { of, Subject } from 'rxjs';

import { IngredientComponent } from './ingredient.component';
import { IngredientService } from '@/app/service/ingredient.service';
import { Ingredient } from '@/types/ingredient.type';

@Component({ selector: 'app-ingredient-card', template: '', standalone: true })
class IngredientCardStub { @Input() ingredient!: Ingredient; }

@Component({ selector: 'app-search-bar', template: '', standalone: true })
class SearchBarStub { @Input() keyword = ''; }

const mockIngredients = [
  { _id: '1', name: 'Tomato' },
  { _id: '2', name: 'Basil' },
] as any[];

const mockResponse = { data: mockIngredients, count: 2 };

describe('IngredientComponent', () => {
  let component: IngredientComponent;
  let fixture: ComponentFixture<IngredientComponent>;
  let ingredientServiceSpy: jasmine.SpyObj<IngredientService>;
  let queryParams$: Subject<any>;

  beforeEach(async () => {
    ingredientServiceSpy = jasmine.createSpyObj('IngredientService', ['findAll']);
    ingredientServiceSpy.findAll.and.returnValue(of(mockResponse));
    queryParams$ = new Subject();

    await TestBed.configureTestingModule({
      imports: [IngredientComponent, NoopAnimationsModule],
      providers: [
        { provide: IngredientService, useValue: ingredientServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParams$.asObservable() },
        },
      ],
    })
      .overrideComponent(IngredientComponent, {
        set: {
          imports: [IngredientCardStub, SearchBarStub],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(IngredientComponent);
    component = fixture.componentInstance;
    queryParams$.next({});        // trigger constructor subscription
    fixture.detectChanges();
  });

  // ── creation ──────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial signal state ──────────────────────────────────────────────────────
  it('should initialise loading to false after load completes', () => {
    expect(component.loading()).toBeFalse();
  });

  it('should initialise limit to 10', () => {
    expect(component.limit()).toBe(10);
  });

  it('should initialise currentPage to 1', () => {
    expect(component.currentPage()).toBe(1);
  });

  it('should initialise keyword to empty string', () => {
    expect(component.keyword()).toBe('');
  });

  // ── queryParams subscription ──────────────────────────────────────────────────
  it('should call loadIngredients on queryParams emission', () => {
    const callsBefore = ingredientServiceSpy.findAll.calls.count();
    queryParams$.next({ keyword: 'rice', page: '2' });
    expect(ingredientServiceSpy.findAll.calls.count()).toBeGreaterThan(callsBefore);
  });

  it('should set keyword from queryParams', () => {
    queryParams$.next({ keyword: 'onion' });
    expect(component.keyword()).toBe('onion');
  });

  it('should set currentPage from queryParams', () => {
    queryParams$.next({ page: '3' });
    expect(component.currentPage()).toBe(3);
  });

  it('should default keyword to empty string when not in queryParams', () => {
    queryParams$.next({});
    expect(component.keyword()).toBe('');
  });

  it('should default currentPage to 1 when not in queryParams', () => {
    queryParams$.next({});
    expect(component.currentPage()).toBe(1);
  });

  // ── loadIngredients ───────────────────────────────────────────────────────────
  it('should populate rows from service response', () => {
    expect(component.rows()).toEqual(mockIngredients);
  });

  it('should set total from service response count', () => {
    expect(component.total()).toBe(2);
  });

  it('should pass current limit, page and keyword to findAll', () => {
    component.keyword.set('pasta');
    component.currentPage.set(2);
    component.limit.set(20);
    component.loadIngredients();
    expect(ingredientServiceSpy.findAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ limit: 20, page: 2, keyword: 'pasta' })
    );
  });

  it('should set loading to false after response via finalize', () => {
    component.loadIngredients();
    expect(component.loading()).toBeFalse();
  });

  // ── onSearch ──────────────────────────────────────────────────────────────────
  it('onSearch should update keyword signal', () => {
    component.onSearch('garlic');
    expect(component.keyword()).toBe('garlic');
  });

  it('onSearch should reset currentPage to 1', () => {
    component.currentPage.set(3);
    component.onSearch('garlic');
    expect(component.currentPage()).toBe(1);
  });

  it('onSearch should call loadIngredients', () => {
    const callsBefore = ingredientServiceSpy.findAll.calls.count();
    component.onSearch('garlic');
    expect(ingredientServiceSpy.findAll.calls.count()).toBeGreaterThan(callsBefore);
  });

  // ── paginatorChange ───────────────────────────────────────────────────────────
  it('paginatorChange should update currentPage (pageIndex + 1)', () => {
    const event: PageEvent = { pageIndex: 2, pageSize: 10, length: 100 };
    component.paginatorChange(event);
    expect(component.currentPage()).toBe(3);
  });

  it('paginatorChange should update limit', () => {
    const event: PageEvent = { pageIndex: 0, pageSize: 25, length: 100 };
    component.paginatorChange(event);
    expect(component.limit()).toBe(25);
  });

  it('paginatorChange should update dto.page', () => {
    const event: PageEvent = { pageIndex: 1, pageSize: 10, length: 100 };
    component.paginatorChange(event);
    expect(component.dto.page).toBe(2);
  });

  it('paginatorChange should call loadIngredients', () => {
    const callsBefore = ingredientServiceSpy.findAll.calls.count();
    const event: PageEvent = { pageIndex: 0, pageSize: 10, length: 100 };
    component.paginatorChange(event);
    expect(ingredientServiceSpy.findAll.calls.count()).toBeGreaterThan(callsBefore);
  });

  // ── goBack ────────────────────────────────────────────────────────────────────
  it('goBack should call window.history.back()', () => {
    spyOn(window.history, 'back');
    component.goBack();
    expect(window.history.back).toHaveBeenCalled();
  });
});
