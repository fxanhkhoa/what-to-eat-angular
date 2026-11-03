import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from './dialog.component';

function createDialogRefSpy() {
  return jasmine.createSpyObj('MatDialogRef', ['close']);
}

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = createDialogRefSpy();

    await TestBed.configureTestingModule({
      imports: [DialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have title as empty string by default', () => {
    expect(component.title).toBe('');
  });

  it('should have showClose as true by default', () => {
    expect(component.showClose).toBeTrue();
  });

  // ── title input ───────────────────────────────────────────────────────────

  it('should render the title when provided', () => {
    component.title = 'My Dialog';
    fixture.detectChanges();
    const h2: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2.textContent?.trim()).toBe('My Dialog');
  });

  it('should not render the title row when title is empty', () => {
    component.title = '';
    fixture.detectChanges();
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2).toBeNull();
  });

  // ── showClose input ───────────────────────────────────────────────────────

  it('should render the close button when showClose is true and title is set', () => {
    component.title = 'Test';
    component.showClose = true;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(btn).not.toBeNull();
  });

  it('should not render the close button when showClose is false', () => {
    component.title = 'Test';
    component.showClose = false;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(btn).toBeNull();
  });

  // ── close() ───────────────────────────────────────────────────────────────

  it('should emit closed event when close() is called', () => {
    const spy = jasmine.createSpy('closedSpy');
    component.closed.subscribe(spy);
    component.close();
    expect(spy).toHaveBeenCalled();
  });

  it('should call dialogRef.close() when close() is called', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should call dialogRef.close() when the close button is clicked', () => {
    component.title = 'Test';
    component.showClose = true;
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[mat-icon-button]');
    btn.click();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should emit closed event when the close button is clicked', () => {
    component.title = 'Test';
    component.showClose = true;
    fixture.detectChanges();
    const spy = jasmine.createSpy('closedSpy');
    component.closed.subscribe(spy);
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[mat-icon-button]');
    btn.click();
    expect(spy).toHaveBeenCalled();
  });
});
