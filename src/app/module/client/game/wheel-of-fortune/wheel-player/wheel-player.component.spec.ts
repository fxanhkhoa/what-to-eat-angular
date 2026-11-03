import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA, LOCALE_ID } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { WheelPlayerComponent } from './wheel-player.component';
import { GameStateService } from '@/app/state/game-state.service';
import { Dish } from '@/types/dish.type';
import { COLOR_PALETTE } from '@/constant/color.constant';

@Component({ selector: 'app-dish-card-fancy', template: '', standalone: true })
class DishCardFancyStub {
  @Input() dish: any;
}

function makeDish(id: string, enTitle = 'Test Dish', viTitle = 'Món ăn'): Dish {
  return {
    _id: id,
    slug: `dish-${id}`,
    title: [
      { lang: 'en', data: enTitle },
      { lang: 'vi', data: viTitle },
    ],
  } as unknown as Dish;
}

describe('WheelPlayerComponent', () => {
  let component: WheelPlayerComponent;
  let fixture: ComponentFixture<WheelPlayerComponent>;
  let gameStateService: jasmine.SpyObj<GameStateService>;

  const testDishes = [
    makeDish('1', 'Pho Bo', 'Phở Bò'),
    makeDish('2', 'Bun Cha', 'Bún Chả'),
    makeDish('3', 'Banh Mi', 'Bánh Mì'),
  ];

  beforeEach(async () => {
    gameStateService = jasmine.createSpyObj('GameStateService', [
      'updateWheelOfFortuneState',
    ]);

    await TestBed.configureTestingModule({
      imports: [WheelPlayerComponent],
      providers: [
        { provide: GameStateService, useValue: gameStateService },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    })
      .overrideComponent(WheelPlayerComponent, {
        set: {
          imports: [OverlayModule, DishCardFancyStub],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WheelPlayerComponent);
    component = fixture.componentInstance;
    // MUST set options before detectChanges so sectors are populated before
    // ngAfterViewInit → createWheel() → rotate() accesses sectors[getIndex()]
    component.options = testDishes;
    fixture.detectChanges();
  });

  // ---- creation -----------------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise ang to 0', () => {
    expect(component.ang).toBe(0);
  });

  it('should initialise angVel to 0', () => {
    expect(component.angVel).toBe(0);
  });

  it('should initialise popoverDish to null', () => {
    expect(component.popoverDish).toBeNull();
  });

  it('should initialise friction to 0.995', () => {
    expect(component.friction).toBe(0.995);
  });

  // ---- options setter -----------------------------------------------------

  describe('options setter', () => {
    it('should create one sector per dish', () => {
      expect(component.sectors.length).toBe(3);
    });

    it('should assign dish to each sector item', () => {
      expect(component.sectors[0].item).toEqual(testDishes[0]);
      expect(component.sectors[1].item).toEqual(testDishes[1]);
    });

    it('should assign color from COLOR_PALETTE using index % length', () => {
      expect(component.sectors[0].color).toBe(COLOR_PALETTE[0 % COLOR_PALETTE.length]);
      expect(component.sectors[1].color).toBe(COLOR_PALETTE[1 % COLOR_PALETTE.length]);
    });

    it('should wrap color palette index when dishes exceed palette length', () => {
      const many = Array.from({ length: COLOR_PALETTE.length + 2 }, (_, i) =>
        makeDish(`d${i}`)
      );
      component.options = many;
      expect(component.sectors[COLOR_PALETTE.length].color).toBe(COLOR_PALETTE[0]);
    });

    it('should update sectors when options is set again after init', () => {
      const newDishes = [makeDish('x', 'New Dish')];
      component.options = newDishes;
      expect(component.sectors.length).toBe(1);
      expect(component.sectors[0].item._id).toBe('x');
    });
  });

  // ---- rand() -------------------------------------------------------------

  describe('rand()', () => {
    it('should return a number between m and M', () => {
      for (let i = 0; i < 20; i++) {
        const v = component.rand(0.25, 0.35);
        expect(v).toBeGreaterThanOrEqual(0.25);
        expect(v).toBeLessThan(0.35);
      }
    });
  });

  // ---- getIndex() ---------------------------------------------------------

  describe('getIndex()', () => {
    it('should return a non-negative integer within sectors range', () => {
      const idx = component.getIndex();
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(component.sectors.length);
    });

    it('should return 0 when ang is 0', () => {
      component.ang = 0;
      expect(component.getIndex()).toBe(0);
    });
  });

  // ---- spinner() ----------------------------------------------------------

  describe('spinner()', () => {
    it('should set angVel when it is 0', () => {
      component.angVel = 0;
      component.spinner();
      expect(component.angVel).toBeGreaterThan(0);
    });

    it('should not assign new random angVel when already non-zero', () => {
      component.angVel = 0.3;
      const randSpy = spyOn(component, 'rand').and.callThrough();
      component.spinner();
      expect(randSpy).not.toHaveBeenCalled();
    });

    it('should set angVel within rand(0.25, 0.35) range', () => {
      component.angVel = 0;
      component.spinner();
      expect(component.angVel).toBeGreaterThanOrEqual(0.25);
      expect(component.angVel).toBeLessThan(0.35);
    });
  });

  // ---- frame() ------------------------------------------------------------

  describe('frame()', () => {
    it('should return immediately when angVel is 0', () => {
      component.angVel = 0;
      const before = component.ang;
      component.frame();
      expect(component.ang).toBe(before);
    });

    it('should multiply angVel by friction', () => {
      component.angVel = 0.1;
      component.frame();
      expect(component.angVel).toBeCloseTo(0.1 * 0.995);
    });

    it('should stop (set angVel to 0) when velocity drops below 0.002', () => {
      component.angVel = 0.001;
      component.frame();
      expect(component.angVel).toBe(0);
    });

    it('should increment ang by angVel', () => {
      component.angVel = 0.1;
      component.ang = 1.0;
      component.frame();
      // ang = (1.0 + 0.1 * 0.995) % TAU ≈ 1.0995
      expect(component.ang).toBeCloseTo(1.0 + 0.1 * 0.995, 4);
    });

    it('should normalise ang modulo TAU', () => {
      component.TAU = 2 * Math.PI;
      component.angVel = 0.1;
      component.ang = component.TAU - 0.05;
      component.frame();
      expect(component.ang).toBeLessThan(component.TAU);
    });
  });

  // ---- selectOption() -----------------------------------------------------

  describe('selectOption()', () => {
    beforeEach(() => {
      // Ensure angVel is 0 so selectOption does its work
      component.angVel = 0;
      component.lastSelection = 0;
    });

    it('should emit optionSelected with the dish _id', () => {
      spyOn(component.optionSelected, 'emit');
      component.selectOption();
      expect(component.optionSelected.emit).toHaveBeenCalledWith(
        testDishes[0]._id
      );
    });

    it('should call updateWheelOfFortuneState with the selected dish', () => {
      component.selectOption();
      expect(gameStateService.updateWheelOfFortuneState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: testDishes[0] })
      );
    });

    it('should pass all sector items in state update', () => {
      component.selectOption();
      const call = gameStateService.updateWheelOfFortuneState.calls.mostRecent();
      expect(call.args[0].items.length).toBe(3);
    });

    it('should not emit when angVel is non-zero', () => {
      component.angVel = 0.1;
      spyOn(component.optionSelected, 'emit');
      component.selectOption();
      expect(component.optionSelected.emit).not.toHaveBeenCalled();
    });

    it('should call createWheel after 1500ms', fakeAsync(() => {
      spyOn(component, 'createWheel');
      component.selectOption();
      tick(1500);
      expect(component.createWheel).toHaveBeenCalled();
    }));
  });

  // ---- onSectorMouseLeave() -----------------------------------------------

  describe('onSectorMouseLeave()', () => {
    it('should set popoverDish to null', () => {
      component.popoverDish = testDishes[0];
      component.onSectorMouseLeave();
      expect(component.popoverDish).toBeNull();
    });
  });

  // ---- onSectorMouseEnter() -----------------------------------------------

  describe('onSectorMouseEnter()', () => {
    it('should set popoverDish to the sector item', () => {
      const sector = component.sectors[1];
      const event = { clientX: 400, clientY: 300 } as MouseEvent;
      component.onSectorMouseEnter(event, sector);
      expect(component.popoverDish).toBe(sector.item);
    });

    it('should set popoverY from event.clientY', () => {
      const sector = component.sectors[0];
      const event = { clientX: 200, clientY: 150 } as MouseEvent;
      component.onSectorMouseEnter(event, sector);
      expect(component.popoverY).toBe(150);
    });

    it('should set popoverX without adjustment when far from right edge', () => {
      const sector = component.sectors[0];
      Object.defineProperty(window, 'innerWidth', { value: 2000, configurable: true });
      const event = { clientX: 200, clientY: 150 } as MouseEvent;
      component.onSectorMouseEnter(event, sector);
      expect(component.popoverX).toBe(200);
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
    });

    it('should adjust popoverX when near right edge', () => {
      const sector = component.sectors[0];
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      const event = { clientX: 200, clientY: 150 } as MouseEvent;
      // 800 - 200 = 600 < 750 → popoverX = window.innerWidth - 750 = 50
      component.onSectorMouseEnter(event, sector);
      expect(component.popoverX).toBe(50);
    });

    it('should adjust popoverX when near right screen edge', () => {
      const sector = component.sectors[0];
      const originalInnerWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', { value: 900, writable: true, configurable: true });
      // clientX = 800 → window.innerWidth - clientX = 100 < 750 threshold → adjust
      const event = { clientX: 800, clientY: 300 } as MouseEvent;
      component.onSectorMouseEnter(event, sector);
      expect(component.popoverX).toBeLessThan(800);
      Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true, configurable: true });
    });
  });

  // ---- onCanvasMouseMove() ------------------------------------------------

  describe('onCanvasMouseMove()', () => {
    it('should call onSectorMouseLeave when cursor is outside the wheel radius', () => {
      spyOn(component, 'onSectorMouseLeave');
      // rad ≈ 250 (half of 500px canvas). clientX=0,clientY=0 → distance from center ≈ 354 > 250
      const event = new MouseEvent('mousemove', { clientX: 0, clientY: 0 });
      component.onCanvasMouseMove(event);
      expect(component.onSectorMouseLeave).toHaveBeenCalled();
    });

    it('should set a sector when cursor is inside the wheel radius', () => {
      spyOn(component, 'onSectorMouseEnter');
      spyOn(component.ctx!.canvas, 'getBoundingClientRect').and.returnValue(
        new DOMRect(0, 0, 500, 500)
      );
      // clientX=250, clientY=250 → (250-250, 250-250) = (0,0) → distance=0 < rad
      const event = new MouseEvent('mousemove', { clientX: 250, clientY: 250 });
      component.onCanvasMouseMove(event);
      expect(component.onSectorMouseEnter).toHaveBeenCalled();
    });

    it('should not throw when ctx is null', () => {
      component.ctx = null;
      const event = new MouseEvent('mousemove', { clientX: 250, clientY: 250 });
      expect(() => component.onCanvasMouseMove(event)).not.toThrow();
    });
  });

  // ---- ngAfterViewInit ----------------------------------------------------

  describe('ngAfterViewInit', () => {
    it('should set ctx from canvas element', () => {
      expect(component.ctx).not.toBeNull();
    });

    it('should set tot to number of sectors', () => {
      expect(component.tot).toBe(testDishes.length);
    });

    it('should set rad to half of canvas width', () => {
      expect(component.rad).toBe(250); // canvas width=500
    });

    it('should set TAU to 2*PI', () => {
      expect(component.TAU).toBeCloseTo(2 * Math.PI);
    });
  });
});
