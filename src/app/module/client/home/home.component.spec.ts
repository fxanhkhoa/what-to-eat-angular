import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA, LOCALE_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HomeComponent } from './home.component';

@Component({ selector: 'app-contact-section', template: '', standalone: true })
class ContactSectionStub {}

@Component({ selector: 'app-dish-section', template: '', standalone: true })
class DishSectionStub {}

@Component({ selector: 'app-game-section', template: '', standalone: true })
class GameSectionStub {}

@Component({ selector: 'app-ingredient-section', template: '', standalone: true })
class IngredientSectionStub {}

@Component({ selector: 'app-quote-section', template: '', standalone: true })
class QuoteSectionStub {}

const overrides = {
  set: {
    imports: [
      ContactSectionStub,
      DishSectionStub,
      GameSectionStub,
      IngredientSectionStub,
      QuoteSectionStub,
    ],
    schemas: [NO_ERRORS_SCHEMA],
  },
};

describe('HomeComponent (en locale)', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let titleService: Title;
  let metaService: Meta;
  let doc: Document;
  let addSvgIconSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [{ provide: LOCALE_ID, useValue: 'en' }],
    })
      .overrideComponent(HomeComponent, overrides)
      .compileComponents();

    const registry = TestBed.inject(MatIconRegistry);
    addSvgIconSpy = spyOn(registry, 'addSvgIcon').and.callThrough();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register facebook SVG icon in constructor', () => {
    expect(addSvgIconSpy).toHaveBeenCalledWith('facebook', jasmine.anything());
  });

  it('should register tiktok SVG icon in constructor', () => {
    expect(addSvgIconSpy).toHaveBeenCalledWith('tiktok', jasmine.anything());
  });

  it('should set English page title', () => {
    expect(titleService.getTitle()).toBe('What To Eat - Discover Your Next Meal');
  });

  it('should set English meta description', () => {
    const tag = metaService.getTag('name="description"');
    expect(tag?.content).toContain('Unlock a world of dining options');
  });

  it('should set English meta keywords', () => {
    const tag = metaService.getTag('name="keywords"');
    expect(tag?.content).toContain('what to eat');
  });

  it('should set English og:title', () => {
    const tag = metaService.getTag('property="og:title"');
    expect(tag?.content).toBe('What To Eat - Discover Your Next Meal');
  });

  it('should set og:description', () => {
    const tag = metaService.getTag('property="og:description"');
    expect(tag?.content).toContain('dining options');
  });

  it('should set og:image', () => {
    const tag = metaService.getTag('property="og:image"');
    expect(tag?.content).toContain('og-image.png');
  });

  it('should set og:url', () => {
    const tag = metaService.getTag('property="og:url"');
    expect(tag?.content).toContain('eatwhat.io.vn');
  });

  it('should set twitter:card to summary_large_image', () => {
    const tag = metaService.getTag('name="twitter:card"');
    expect(tag?.content).toBe('summary_large_image');
  });

  it('should set twitter:title', () => {
    const tag = metaService.getTag('name="twitter:title"');
    expect(tag?.content).toBe('What To Eat - Discover Your Next Meal');
  });

  it('should set twitter:image', () => {
    const tag = metaService.getTag('name="twitter:image"');
    expect(tag?.content).toContain('og-image.png');
  });

  it('should add canonical link with /en path', () => {
    const canonical = doc.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toContain('/en');
  });

  it('should add hreflang vi alternate link', () => {
    const link = doc.querySelector('link[rel="alternate"][hreflang="vi"]');
    expect(link?.getAttribute('href')).toContain('/vi');
  });

  it('should add hreflang en alternate link', () => {
    const link = doc.querySelector('link[rel="alternate"][hreflang="en"]');
    expect(link?.getAttribute('href')).toContain('/en');
  });

  it('should add hreflang x-default alternate link', () => {
    const link = doc.querySelector('link[rel="alternate"][hreflang="x-default"]');
    expect(link).toBeTruthy();
  });

  it('should replace existing canonical on repeated ngOnInit calls', () => {
    component.ngOnInit();
    const canonicals = doc.querySelectorAll('link[rel="canonical"]');
    expect(canonicals.length).toBe(1);
  });

  it('should replace existing hreflang links on repeated ngOnInit calls', () => {
    component.ngOnInit();
    const hreflangs = doc.querySelectorAll('link[rel="alternate"][hreflang]');
    expect(hreflangs.length).toBe(3);
  });

  it('should remove canonical link on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('should remove all hreflang links on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(doc.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(0);
  });

  it('should remove structured-data script on ngOnDestroy if present', () => {
    const script = doc.createElement('script');
    script.id = 'dish-structured-data';
    doc.head.appendChild(script);
    component.ngOnDestroy();
    expect(doc.getElementById('dish-structured-data')).toBeNull();
  });

  it('should not throw on ngOnDestroy when structured-data script is absent', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});

describe('HomeComponent (vi locale)', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let titleService: Title;
  let metaService: Meta;
  let doc: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [{ provide: LOCALE_ID, useValue: 'vi' }],
    })
      .overrideComponent(HomeComponent, overrides)
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set Vietnamese page title', () => {
    expect(titleService.getTitle()).toBe(
      'Ăn gì hôm nay - Khám phá bữa ăn tiếp theo của bạn'
    );
  });

  it('should set Vietnamese meta description', () => {
    const tag = metaService.getTag('name="description"');
    expect(tag?.content).toContain('Khám phá thế giới ẩm thực');
  });

  it('should set Vietnamese meta keywords', () => {
    const tag = metaService.getTag('name="keywords"');
    expect(tag?.content).toContain('ẩm thực Việt Nam');
  });

  it('should set Vietnamese og:title', () => {
    const tag = metaService.getTag('property="og:title"');
    expect(tag?.content).toBe('Ăn gì hôm nay - Khám phá bữa ăn tiếp theo của bạn');
  });

  it('should set Vietnamese twitter:title', () => {
    const tag = metaService.getTag('name="twitter:title"');
    expect(tag?.content).toBe('Ăn gì hôm nay - Khám phá bữa ăn tiếp theo của bạn');
  });

  it('should add canonical link with /vi path', () => {
    const canonical = doc.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toContain('/vi');
  });
});

