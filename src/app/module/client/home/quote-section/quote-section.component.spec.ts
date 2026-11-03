import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { QuoteSectionComponent } from './quote-section.component';

describe('QuoteSectionComponent', () => {
  let component: QuoteSectionComponent;
  let fixture: ComponentFixture<QuoteSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteSectionComponent, NoopAnimationsModule],
    })
      .overrideComponent(QuoteSectionComponent, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(QuoteSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ──────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial state ─────────────────────────────────────────────────────────────
  it('should have 5 quotes', () => {
    expect(component.quotes.length).toBe(5);
  });

  it('each quote should have a text array and an author', () => {
    component.quotes.forEach((q) => {
      expect(q.text.length).toBeGreaterThan(0);
      expect(q.author).toBeTruthy();
    });
  });

  it('each quote text entry should have lang and data fields', () => {
    component.quotes.forEach((q) => {
      q.text.forEach((t) => {
        expect(t.lang).toBeTruthy();
        expect(t.data).toBeTruthy();
      });
    });
  });

  it('currentQuote should initially be the first quote', () => {
    // ngOnInit calls getRandomQuote which sets visible=false then schedules an update;
    // before the timeout fires, currentQuote is still quotes[0]
    expect(component.currentQuote).toEqual(component.quotes[0]);
  });

  // ── getRandomQuote ────────────────────────────────────────────────────────────
  it('getRandomQuote should set visible to false immediately', () => {
    component.getRandomQuote();
    expect(component.visible).toBeFalse();
  });

  it('getRandomQuote should set visible back to true after 300ms', fakeAsync(() => {
    component.getRandomQuote();
    expect(component.visible).toBeFalse();
    tick(300);
    expect(component.visible).toBeTrue();
  }));

  it('getRandomQuote should pick a quote from the quotes array', fakeAsync(() => {
    component.getRandomQuote();
    tick(300);
    expect(component.quotes).toContain(component.currentQuote);
  }));

  it('getRandomQuote should always set currentQuote to one of the 5 quotes', fakeAsync(() => {
    for (let i = 0; i < 20; i++) {
      const previousVisible = component.visible;
      component.getRandomQuote();
      tick(300);
      expect(component.quotes).toContain(component.currentQuote);
    }
  }));

  // ── ngOnInit ──────────────────────────────────────────────────────────────────
  it('ngOnInit should call getRandomQuote (visible starts false until timeout)', fakeAsync(() => {
    // fresh component — ngOnInit already ran in beforeEach; verify visible was flipped
    const comp2 = TestBed.createComponent(QuoteSectionComponent).componentInstance;
    // Before detectChanges, visible is still true (default)
    expect(comp2.visible).toBeTrue();
    comp2.ngOnInit();
    expect(comp2.visible).toBeFalse(); // getRandomQuote sets it to false immediately
    tick(300);
    expect(comp2.visible).toBeTrue();
  }));

  // ── quotes content spot-checks ────────────────────────────────────────────────
  it('first quote author should be Virginia Woolf', () => {
    expect(component.quotes[0].author).toBe('Virginia Woolf');
  });

  it('second quote author should be Julia Child', () => {
    expect(component.quotes[1].author).toBe('Julia Child');
  });

  it('last quote author should be Ernestine Ulmer', () => {
    expect(component.quotes[component.quotes.length - 1].author).toBe('Ernestine Ulmer');
  });

  it('each quote should have both en and vi translations', () => {
    component.quotes.forEach((q) => {
      const langs = q.text.map((t) => t.lang);
      expect(langs).toContain('en');
      expect(langs).toContain('vi');
    });
  });
});
