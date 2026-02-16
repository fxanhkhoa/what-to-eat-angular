import { TestBed } from '@angular/core/testing';
import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CategoryComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('renders categories as spans', () => {
    const fixture = TestBed.createComponent(CategoryComponent);
    const component = fixture.componentInstance;

    component.categories = ['Fruits', 'Vegan'];
    fixture.detectChanges();

    const spans = fixture.nativeElement.querySelectorAll('span');
    expect(spans.length).toBe(2);
    expect(spans[0].textContent.trim()).toBe('Fruits');
    expect(spans[1].textContent.trim()).toBe('Vegan');
  });

  it('renders nothing when categories empty', () => {
    const fixture = TestBed.createComponent(CategoryComponent);
    const component = fixture.componentInstance;

    component.categories = [];
    fixture.detectChanges();

    const spans = fixture.nativeElement.querySelectorAll('span');
    expect(spans.length).toBe(0);
  });
});
