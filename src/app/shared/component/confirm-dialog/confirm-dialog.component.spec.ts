import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;
  let mockData: { mainMsg: string; subMsg: string };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockData = {
      mainMsg: 'Test Main Message',
      subMsg: 'Test Sub Message',
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject dialog data correctly', () => {
    expect(component.data).toEqual(mockData);
    expect(component.data.mainMsg).toBe('Test Main Message');
    expect(component.data.subMsg).toBe('Test Sub Message');
  });

  it('should display main message in dialog title', () => {
    const titleElement: DebugElement = fixture.debugElement.query(
      By.css('h1[mat-dialog-title]')
    );
    expect(titleElement.nativeElement.textContent).toContain(
      'Test Main Message'
    );
  });

  it('should display sub message in dialog content', () => {
    const contentElement: DebugElement = fixture.debugElement.query(
      By.css('[mat-dialog-content] p')
    );
    expect(contentElement.nativeElement.innerHTML).toContain(
      'Test Sub Message'
    );
  });

  it('should apply yellow color class to title', () => {
    const titleElement: DebugElement = fixture.debugElement.query(
      By.css('h1[mat-dialog-title]')
    );
    expect(titleElement.nativeElement.classList.contains('text-yellow-500')).toBe(true);
  });

  it('should render confirm button with correct icon', () => {
    const confirmButton = fixture.debugElement.query(
      By.css('button[color="warn"]')
    );
    expect(confirmButton).toBeTruthy();
    
    const icon = confirmButton.query(By.css('mat-icon'));
    expect(icon.nativeElement.textContent.trim()).toBe('done');
  });

  it('should render cancel button with correct icon', () => {
    const buttons = fixture.debugElement.queryAll(
      By.css('button[mat-raised-button]')
    );
    const cancelButton = buttons[1];
    expect(cancelButton).toBeTruthy();
    
    const icon = cancelButton.query(By.css('mat-icon'));
    expect(icon.nativeElement.textContent.trim()).toBe('close');
  });

  describe('onConfirm', () => {
    it('should close dialog with true when onConfirm is called', () => {
      component.onConfirm();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should close dialog with true when confirm button is clicked', () => {
      const confirmButton = fixture.debugElement.query(
        By.css('button[color="warn"]')
      );
      confirmButton.nativeElement.click();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  describe('onCancel', () => {
    it('should close dialog with false when onCancel is called', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should close dialog with false when cancel button is clicked', () => {
      const buttons = fixture.debugElement.queryAll(
        By.css('button[mat-raised-button]')
      );
      const cancelButton = buttons[1];
      cancelButton.nativeElement.click();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('HTML content rendering', () => {
    it('should render HTML content in sub message using innerHTML', () => {
      const htmlData = {
        mainMsg: 'HTML Test',
        subMsg: '<strong>Bold text</strong> and <em>italic text</em>',
      };

      const newFixture = TestBed.createComponent(ConfirmDialogComponent);
      newFixture.componentInstance.data = htmlData;
      newFixture.detectChanges();

      const contentElement: DebugElement = newFixture.debugElement.query(
        By.css('[mat-dialog-content] p')
      );
      const innerHTML = contentElement.nativeElement.innerHTML;
      
      expect(innerHTML).toContain('<strong>Bold text</strong>');
      expect(innerHTML).toContain('<em>italic text</em>');
    });
  });

  describe('Dialog actions alignment', () => {
    it('should align dialog actions to the end', () => {
      const actionsElement: DebugElement = fixture.debugElement.query(
        By.css('[mat-dialog-actions]')
      );
      expect(actionsElement.nativeElement.getAttribute('align')).toBe('end');
    });
  });
});
