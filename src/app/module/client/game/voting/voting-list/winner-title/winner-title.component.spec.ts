import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { of, Subject } from 'rxjs';
import { WinnerTitleComponent } from './winner-title.component';
import { DishService } from '@/app/service/dish.service';
import { Dish } from '@/types/dish.type';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

function makeDish(titles: { lang: string; data: string }[]): Dish {
  return {
    _id: 'dish-1',
    slug: 'pho-bo',
    title: titles,
  } as unknown as Dish;
}

describe('WinnerTitleComponent', () => {
  let component: WinnerTitleComponent;
  let fixture: ComponentFixture<WinnerTitleComponent>;
  let dishService: jasmine.SpyObj<DishService>;

  async function setup(locale = 'en') {
    dishService = jasmine.createSpyObj('DishService', ['findBySlug']);
    dishService.findBySlug.and.returnValue(
      of(makeDish([
        { lang: 'en', data: 'Beef Noodle Soup' },
        { lang: 'vi', data: 'Phở Bò' },
      ]))
    );

    await TestBed.configureTestingModule({
      imports: [WinnerTitleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DishService, useValue: dishService },
        { provide: LOCALE_ID, useValue: locale },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WinnerTitleComponent);
    component = fixture.componentInstance;
    component.slug = 'pho-bo';
  }

  afterEach(() => TestBed.resetTestingModule());

  // ---- creation -----------------------------------------------------------

  describe('creation (en locale)', () => {
    beforeEach(async () => {
      await setup('en');
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialise title signal to empty string', () => {
      // title is set synchronously in ngOnInit, but before detectChanges it is ''
      const fresh = TestBed.createComponent(WinnerTitleComponent);
      expect(fresh.componentInstance.title()).toBe('');
    });
  });

  // ---- ngOnInit -----------------------------------------------------------

  describe('ngOnInit', () => {
    beforeEach(async () => await setup('en'));

    it('should call findBySlug with the given slug', () => {
      fixture.detectChanges();
      expect(dishService.findBySlug).toHaveBeenCalledWith('pho-bo');
    });

    it('should set title to the matched locale data (en)', () => {
      fixture.detectChanges();
      expect(component.title()).toBe('Beef Noodle Soup');
    });

    it('should set title to "---" when no matching locale entry exists', () => {
      dishService.findBySlug.and.returnValue(
        of(makeDish([{ lang: 'fr', data: 'Soupe de bœuf' }]))
      );
      fixture.detectChanges();
      expect(component.title()).toBe('---');
    });

    it('should set title to "---" when title array is empty', () => {
      dishService.findBySlug.and.returnValue(of(makeDish([])));
      fixture.detectChanges();
      expect(component.title()).toBe('---');
    });

    it('should update title reactively when observable emits multiple values', () => {
      const subject = new Subject<Dish>();
      dishService.findBySlug.and.returnValue(subject.asObservable());
      fixture.detectChanges();
      expect(component.title()).toBe('');

      subject.next(makeDish([{ lang: 'en', data: 'First Title' }]));
      expect(component.title()).toBe('First Title');

      subject.next(makeDish([{ lang: 'en', data: 'Updated Title' }]));
      expect(component.title()).toBe('Updated Title');
    });
  });

  // ---- ngOnInit with vi locale --------------------------------------------

  describe('ngOnInit (vi locale)', () => {
    beforeEach(async () => await setup('vi'));

    it('should set title to the matched locale data (vi)', () => {
      fixture.detectChanges();
      expect(component.title()).toBe('Phở Bò');
    });

    it('should fall back to "---" when vi entry is absent', () => {
      dishService.findBySlug.and.returnValue(
        of(makeDish([{ lang: 'en', data: 'Beef Noodle Soup' }]))
      );
      fixture.detectChanges();
      expect(component.title()).toBe('---');
    });
  });

  // ---- template -----------------------------------------------------------

  describe('template', () => {
    beforeEach(async () => {
      await setup('en');
      fixture.detectChanges();
    });

    it('should render the title in a <span>', () => {
      const span = fixture.debugElement.query(By.css('span'));
      expect(span).not.toBeNull();
      expect(span.nativeElement.textContent).toBe('Beef Noodle Soup');
    });

    it('should update the <span> text when title signal changes', () => {
      component.title.set('New Title');
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('span'));
      expect(span.nativeElement.textContent).toBe('New Title');
    });

    it('should show "---" in the span when no locale match', () => {
      dishService.findBySlug.and.returnValue(of(makeDish([])));
      component.ngOnInit();
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('span'));
      expect(span.nativeElement.textContent).toBe('---');
    });
  });
});
