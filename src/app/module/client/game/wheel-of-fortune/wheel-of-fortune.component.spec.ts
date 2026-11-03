import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Input, NO_ERRORS_SCHEMA, LOCALE_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Title, Meta } from '@angular/platform-browser';
import { of, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WheelOfFortuneComponent } from './wheel-of-fortune.component';
import { DishService } from '@/app/service/dish.service';
import { GameStateService } from '@/app/state/game-state.service';
import { Dish } from '@/types/dish.type';
import { GameState } from '@/types/game.type';

@Component({ selector: 'app-wheel-player', template: '', standalone: true })
class WheelPlayerStub {
  @Input() options: any[] = [];
}

@Component({ selector: 'app-wheel-dish-picker', template: '', standalone: true })
class WheelDishPickerStub {}

@Component({ selector: 'app-wheel-collection-picker', template: '', standalone: true })
class WheelCollectionPickerStub {}

function makeDish(id: string): Dish {
  return { _id: id, slug: `dish-${id}`, title: [] } as unknown as Dish;
}

function makeState(overrides: Partial<GameState['wheelOfFortune']> = {}): GameState {
  return {
    wheelOfFortune: { selectedItem: null, items: [], ...overrides },
    flippingCard: { selectedItem: null, items: [] },
  };
}

describe('WheelOfFortuneComponent', () => {
  let component: WheelOfFortuneComponent;
  let fixture: ComponentFixture<WheelOfFortuneComponent>;
  let dishService: jasmine.SpyObj<DishService>;
  let gameStateService: jasmine.SpyObj<GameStateService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let titleService: jasmine.SpyObj<Title>;
  let metaService: jasmine.SpyObj<Meta>;
  let stateSubject: BehaviorSubject<GameState>;

  async function setup(locale = 'en') {
    stateSubject = new BehaviorSubject<GameState>(makeState());
    dishService = jasmine.createSpyObj('DishService', ['findRandom']);
    dishService.findRandom.and.returnValue(of([makeDish('r1'), makeDish('r2')]));

    gameStateService = jasmine.createSpyObj('GameStateService', [
      'getGameState',
      'updateWheelOfFortuneState',
    ]);
    gameStateService.getGameState.and.returnValue(stateSubject.asObservable());

    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(false));
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialog.open.and.returnValue(dialogRef as any);

    titleService = jasmine.createSpyObj('Title', ['setTitle']);
    metaService = jasmine.createSpyObj('Meta', ['updateTag']);

    await TestBed.configureTestingModule({
      imports: [
        WheelOfFortuneComponent,
        RouterModule.forRoot([]),
        NoopAnimationsModule,
      ],
      providers: [
        { provide: DishService, useValue: dishService },
        { provide: GameStateService, useValue: gameStateService },
        { provide: MatDialog, useValue: dialog },
        { provide: Title, useValue: titleService },
        { provide: Meta, useValue: metaService },
        { provide: LOCALE_ID, useValue: locale },
      ],
    })
      .overrideComponent(WheelOfFortuneComponent, {
        set: {
          imports: [
            RouterModule,
            WheelPlayerStub,
            WheelDishPickerStub,
            WheelCollectionPickerStub,
          ],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WheelOfFortuneComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  // ---- creation -----------------------------------------------------------

  describe('creation', () => {
    beforeEach(async () => {
      await setup();
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialise dishes to []', () => {
      // dishes are populated via initialize() — after detectChanges random dishes loaded
      expect(Array.isArray(component.dishes())).toBeTrue();
    });

    it('should initialise loading to false after ngOnInit completes', () => {
      expect(component.loading()).toBeFalse();
    });
  });

  // ---- initialize() — no cached items → findRandom -----------------------

  describe('initialize() — no cached items', () => {
    beforeEach(async () => {
      await setup();
      fixture.detectChanges();
    });

    it('should call dishService.findRandom(7) when state has no items', () => {
      expect(dishService.findRandom).toHaveBeenCalledWith(7);
    });

    it('should set dishes from findRandom result', () => {
      expect(component.dishes().length).toBe(2);
      expect(component.dishes()[0]._id).toBe('r1');
    });

    it('should update game state with fetched dishes', () => {
      expect(gameStateService.updateWheelOfFortuneState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: null, items: component.dishes() })
      );
    });

    it('should set loading to false after load', () => {
      expect(component.loading()).toBeFalse();
    });
  });

  // ---- initialize() — cached items in state -------------------------------

  describe('initialize() — state has cached items', () => {
    const cached = [makeDish('c1'), makeDish('c2'), makeDish('c3')];

    beforeEach(async () => {
      await setup();
      stateSubject = new BehaviorSubject<GameState>(
        makeState({ items: cached })
      );
      gameStateService.getGameState.and.returnValue(stateSubject.asObservable());
      fixture.detectChanges();
    });

    it('should NOT call findRandom when cached items exist', () => {
      expect(dishService.findRandom).not.toHaveBeenCalled();
    });

    it('should set dishes from cached state items', () => {
      expect(component.dishes().length).toBe(3);
      expect(component.dishes()[0]._id).toBe('c1');
    });
  });

  // ---- initialize() — selectedItem in state → dialog ----------------------

  describe('initialize() — state has selectedItem', () => {
    const selected = makeDish('sel');
    const remaining = [makeDish('a'), makeDish('b')];
    let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;

    beforeEach(async () => {
      await setup();
      dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(true)); // user confirmed removal
      dialog.open.and.returnValue(dialogRef as any);

      stateSubject = new BehaviorSubject<GameState>(
        makeState({ selectedItem: selected, items: [selected, ...remaining] })
      );
      gameStateService.getGameState.and.returnValue(stateSubject.asObservable());
      fixture.detectChanges();
    });

    it('should open SelectedDishModalComponent dialog', () => {
      expect(dialog.open).toHaveBeenCalled();
    });

    it('should pass selectedItem as dialog data', () => {
      expect(dialog.open).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({ data: selected })
      );
    });

    it('should update state with selectedItem removed when dialog closes with truthy', () => {
      expect(gameStateService.updateWheelOfFortuneState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: null })
      );
    });
  });

  describe('initialize() — dialog closes with falsy (cancel)', () => {
    const selected = makeDish('sel');

    beforeEach(async () => {
      await setup();
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(false));
      dialog.open.and.returnValue(dialogRef as any);

      stateSubject = new BehaviorSubject<GameState>(
        makeState({ selectedItem: selected, items: [selected] })
      );
      gameStateService.getGameState.and.returnValue(stateSubject.asObservable());
      gameStateService.updateWheelOfFortuneState.calls.reset();
      fixture.detectChanges();
    });

    it('should not update state via dialog callback when dialog is cancelled', () => {
      // When afterClosed returns falsy, the update block inside afterClosed is skipped.
      // The subscribe path returns early (res is null) so updateWheelOfFortuneState not called.
      expect(gameStateService.updateWheelOfFortuneState).not.toHaveBeenCalled();
    });
  });

  // ---- ngOnDestroy --------------------------------------------------------

  describe('ngOnDestroy', () => {
    beforeEach(async () => {
      await setup();
      fixture.detectChanges();
    });

    it('should call updateWheelOfFortuneState on destroy', () => {
      gameStateService.updateWheelOfFortuneState.calls.reset();
      component.ngOnDestroy();
      expect(gameStateService.updateWheelOfFortuneState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: null })
      );
    });

    it('should remove canonical link added by ngOnInit on destroy', () => {
      // ngOnInit (called during fixture.detectChanges) adds a canonical link
      expect(document.querySelector('link[rel="canonical"]')).not.toBeNull();
      component.ngOnDestroy();
      expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    });
  });

  // ---- goBack() -----------------------------------------------------------

  describe('goBack()', () => {
    beforeEach(async () => {
      await setup();
      fixture.detectChanges();
    });

    it('should call window.history.back()', () => {
      spyOn(window.history, 'back');
      component.goBack();
      expect(window.history.back).toHaveBeenCalled();
    });
  });

  // ---- SEO — English locale -----------------------------------------------

  describe('SEO (en locale)', () => {
    beforeEach(async () => {
      await setup('en');
      fixture.detectChanges();
    });

    it('should set English title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(
        'Wheel of Fortune | What To Eat'
      );
    });

    it('should set English description meta tag', () => {
      expect(metaService.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'description',
          content: jasmine.stringContaining('Spin the wheel'),
        })
      );
    });

    it('should set og:title meta tag', () => {
      expect(metaService.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ property: 'og:title' })
      );
    });

    it('should set robots meta tag', () => {
      expect(metaService.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'robots', content: 'index, follow' })
      );
    });
  });

  // ---- SEO — Vietnamese locale --------------------------------------------

  describe('SEO (vi locale)', () => {
    beforeEach(async () => {
      await setup('vi');
      fixture.detectChanges();
    });

    it('should set Vietnamese title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(
        'Vòng quay may mắn | What To Eat'
      );
    });

    it('should set Vietnamese description meta tag', () => {
      expect(metaService.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'description',
          content: jasmine.stringContaining('Quay vòng'),
        })
      );
    });
  });

  // ---- template -----------------------------------------------------------

  describe('template', () => {
    beforeEach(async () => {
      await setup();
      fixture.detectChanges();
    });

    it('should show spinner while loading', () => {
      component.loading.set(true);
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).not.toBeNull();
    });

    it('should hide spinner when not loading', () => {
      component.loading.set(false);
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeNull();
    });

    it('should render app-wheel-player when dishes are present', () => {
      component.dishes.set([makeDish('t1')]);
      fixture.detectChanges();
      const player = fixture.debugElement.query(By.css('app-wheel-player'));
      expect(player).not.toBeNull();
    });

    it('should not render app-wheel-player when dishes list is empty', () => {
      component.dishes.set([]);
      component.loading.set(false);
      fixture.detectChanges();
      const player = fixture.debugElement.query(By.css('app-wheel-player'));
      expect(player).toBeNull();
    });

    it('should call goBack when Back button is clicked', () => {
      spyOn(component, 'goBack');
      const backBtn = fixture.debugElement.query(By.css('button'));
      backBtn.nativeElement.click();
      expect(component.goBack).toHaveBeenCalled();
    });

    it('should render app-wheel-collection-picker', () => {
      const picker = fixture.debugElement.query(
        By.css('app-wheel-collection-picker')
      );
      expect(picker).not.toBeNull();
    });

    it('should render app-wheel-dish-picker', () => {
      const picker = fixture.debugElement.query(By.css('app-wheel-dish-picker'));
      expect(picker).not.toBeNull();
    });
  });
});
