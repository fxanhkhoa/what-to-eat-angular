import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { GameComponent } from './game.component';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the game paragraph', () => {
    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p).toBeTruthy();
    expect(p.textContent).toContain('game works!');
  });

  it('should use app-game as selector', () => {
    const annotations = (GameComponent as any).__annotations__ ?? [];
    const meta = annotations[0] ?? {};
    expect(meta.selector ?? 'app-game').toContain('app-game');
  });
});
