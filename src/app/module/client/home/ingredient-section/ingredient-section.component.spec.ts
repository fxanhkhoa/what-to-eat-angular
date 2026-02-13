import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { IngredientSectionComponent } from './ingredient-section.component';
import { IngredientService } from '@/app/service/ingredient.service';
import { LOCALE_ID, PLATFORM_ID } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

describe('IngredientSectionComponent', () => {
  let component: IngredientSectionComponent;
  let fixture: ComponentFixture<IngredientSectionComponent>;
  let mockIngredientService: jasmine.SpyObj<IngredientService>;
  let mockIconRegistry: jasmine.SpyObj<MatIconRegistry>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    mockIngredientService = jasmine.createSpyObj('IngredientService', [
      'findRandom',
    ]);
    mockIngredientService.findRandom.and.returnValue(of([]));

    mockIconRegistry = jasmine.createSpyObj('MatIconRegistry', [
      'addSvgIcon',
      'getDefaultFontSetClass',
      'getNamedSvgIcon',
    ]);
    mockIconRegistry.getDefaultFontSetClass.and.returnValue(['material-icons']);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockIconRegistry.getNamedSvgIcon.and.returnValue(of(svg));
    mockSanitizer = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustResourceUrl',
    ]);
    mockSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe');

    await TestBed.configureTestingModule({
      imports: [IngredientSectionComponent],
      providers: [
        { provide: IngredientService, useValue: mockIngredientService },
        { provide: LOCALE_ID, useValue: 'en-US' },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: MatIconRegistry, useValue: mockIconRegistry },
        { provide: DomSanitizer, useValue: mockSanitizer },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call IngredientService.findRandom on init', () => {
    const recent = mockIngredientService.findRandom.calls.mostRecent();
    expect(recent).toBeTruthy();
    expect(recent.args[0]).toBe(12);
    expect(recent.args[1]).toEqual([]);
  });
});
