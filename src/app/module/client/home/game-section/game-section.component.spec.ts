import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { GameSectionComponent } from './game-section.component';

describe('GameSectionComponent', () => {
  let component: GameSectionComponent;
  let fixture: ComponentFixture<GameSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSectionComponent, NoopAnimationsModule, RouterModule.forRoot([])],
    })
      .overrideComponent(GameSectionComponent, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GameSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ─────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial state ─────────────────────────────────────────────────────────────
  it('should initialise currentSlide to 0', () => {
    expect(component.currentSlide()).toBe(0);
  });

  it('should initialise hoveredCard to null', () => {
    expect(component.hoveredCard()).toBeNull();
  });

  it('should have 3 slides', () => {
    expect(component.slides.length).toBe(3);
  });

  // ── slides content ────────────────────────────────────────────────────────────
  it('each slide should have id, image, title and description', () => {
    component.slides.forEach((slide) => {
      expect(slide.id).toBeDefined();
      expect(slide.image).toBeDefined();
      expect(slide.title.length).toBeGreaterThan(0);
      expect(slide.description.length).toBeGreaterThan(0);
    });
  });

  // ── onNextClick ───────────────────────────────────────────────────────────────
  it('onNextClick should advance currentSlide from 0 to 1', () => {
    component.onNextClick();
    expect(component.currentSlide()).toBe(1);
  });

  it('onNextClick should advance currentSlide from 1 to 2', () => {
    component.currentSlide.set(1);
    component.onNextClick();
    expect(component.currentSlide()).toBe(2);
  });

  it('onNextClick should wrap from last slide back to 0', () => {
    component.currentSlide.set(component.slides.length - 1);
    component.onNextClick();
    expect(component.currentSlide()).toBe(0);
  });

  // ── onPreviousClick ───────────────────────────────────────────────────────────
  it('onPreviousClick should go from 1 to 0', () => {
    component.currentSlide.set(1);
    component.onPreviousClick();
    expect(component.currentSlide()).toBe(0);
  });

  it('onPreviousClick should wrap from 0 to last slide', () => {
    component.currentSlide.set(0);
    component.onPreviousClick();
    expect(component.currentSlide()).toBe(component.slides.length - 1);
  });

  it('onPreviousClick should go from 2 to 1', () => {
    component.currentSlide.set(2);
    component.onPreviousClick();
    expect(component.currentSlide()).toBe(1);
  });

  // ── goToSlide ─────────────────────────────────────────────────────────────────
  it('goToSlide should set currentSlide to the given index', () => {
    component.goToSlide(2);
    expect(component.currentSlide()).toBe(2);
  });

  it('goToSlide(0) should reset to first slide', () => {
    component.currentSlide.set(2);
    component.goToSlide(0);
    expect(component.currentSlide()).toBe(0);
  });

  // ── getGameRoute ──────────────────────────────────────────────────────────────
  it('getGameRoute(0) should return wheel-of-fortune route', () => {
    expect(component.getGameRoute(0)).toBe('/game/wheel-of-fortune');
  });

  it('getGameRoute(1) should return flipping-card route', () => {
    expect(component.getGameRoute(1)).toBe('/game/flipping-card');
  });

  it('getGameRoute(2) should return voting route', () => {
    expect(component.getGameRoute(2)).toBe('/game/voting');
  });

  it('getGameRoute with out-of-range index should return /game', () => {
    expect(component.getGameRoute(99)).toBe('/game');
  });

  // ── getGameIcon ───────────────────────────────────────────────────────────────
  it('getGameIcon(0) should return casino', () => {
    expect(component.getGameIcon(0)).toBe('casino');
  });

  it('getGameIcon(1) should return style', () => {
    expect(component.getGameIcon(1)).toBe('style');
  });

  it('getGameIcon(2) should return how_to_vote', () => {
    expect(component.getGameIcon(2)).toBe('how_to_vote');
  });

  it('getGameIcon with out-of-range index should return gamepad', () => {
    expect(component.getGameIcon(99)).toBe('gamepad');
  });

  // ── getGameFeatures ───────────────────────────────────────────────────────────
  it('getGameFeatures(0) should return 3 features for wheel', () => {
    const features = component.getGameFeatures(0);
    expect(features).toContain('Random Selection');
    expect(features).toContain('Quick Decision');
    expect(features).toContain('Fun & Interactive');
  });

  it('getGameFeatures(1) should return features for flipping card', () => {
    const features = component.getGameFeatures(1);
    expect(features).toContain('Memory Challenge');
  });

  it('getGameFeatures(2) should return features for voting', () => {
    const features = component.getGameFeatures(2);
    expect(features).toContain('Group Activity');
    expect(features).toContain('Democratic Choice');
  });

  it('getGameFeatures with out-of-range index should return empty array', () => {
    expect(component.getGameFeatures(99)).toEqual([]);
  });
});
