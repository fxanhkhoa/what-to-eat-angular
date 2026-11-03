import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactDetailsDialogComponent } from './contact-details-dialog.component';
import { Contact } from '@/types/contact.type';

describe('ContactDetailsDialogComponent', () => {
  let component: ContactDetailsDialogComponent;
  let fixture: ComponentFixture<ContactDetailsDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ContactDetailsDialogComponent>>;

  const mockContact: Contact = {
    _id: '1',
    email: 'test@example.com',
    name: 'John Doe',
    message: 'This is a test message',
    deleted: false,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
    deletedAt: undefined,
    deletedBy: undefined,
    updatedBy: 'admin@example.com',
    createdBy: 'user@example.com',
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ContactDetailsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockContact }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject dialog data', () => {
    expect(component.data).toEqual(mockContact);
  });

  it('should inject dialog ref', () => {
    expect(component.dialogRef).toBe(dialogRefSpy);
  });

  it('should call dialogRef.close() when close() is invoked', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should display contact name', () => {
    const nameElement = fixture.nativeElement.querySelector('[i18n=""]') || 
                        fixture.nativeElement.textContent;
    expect(fixture.nativeElement.textContent).toContain(mockContact.name);
  });

  it('should display contact email', () => {
    expect(fixture.nativeElement.textContent).toContain(mockContact.email);
  });

  it('should display contact message', () => {
    expect(fixture.nativeElement.textContent).toContain(mockContact.message);
  });

  it('should display active status for non-deleted contact', () => {
    expect(fixture.nativeElement.textContent).toContain('Active');
    expect(fixture.nativeElement.textContent).not.toContain('Deleted');
  });

  it('should display deleted status for deleted contact', () => {
    component.data = { ...mockContact, deleted: true };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Deleted');
  });

  it('should format date with locale en-US', () => {
    const date = '2024-03-15T14:30:00Z';
    const formatted = component.formatDate(date);
    expect(formatted).toContain('March');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
    // Time format includes either AM or PM
    expect(formatted).toMatch(/AM|PM/);
  });

  it('should format createdAt date correctly', () => {
    const formattedCreatedAt = component.formatDate(mockContact.createdAt);
    expect(formattedCreatedAt).toBeTruthy();
    expect(formattedCreatedAt).toContain('2024');
  });

  it('should format updatedAt date correctly when available', () => {
    const formattedUpdatedAt = component.formatDate(mockContact.updatedAt!);
    expect(formattedUpdatedAt).toBeTruthy();
    expect(formattedUpdatedAt).toContain('2024');
  });

  it('should handle date formatting for invalid date string', () => {
    const formatted = component.formatDate('invalid-date');
    expect(formatted).toBeTruthy();
  });

  it('should display close button', () => {
    const closeButton = fixture.nativeElement.querySelector('button[mat-button]');
    expect(closeButton).toBeTruthy();
  });

  it('should call close() when close button is clicked', () => {
    spyOn(component, 'close');
    const closeButton = fixture.nativeElement.querySelector('button[mat-button]');
    closeButton.click();
    expect(component.close).toHaveBeenCalled();
  });

  it('should call close() when icon button (X) is clicked', () => {
    spyOn(component, 'close');
    const iconButton = fixture.nativeElement.querySelector('button[mat-icon-button]');
    iconButton.click();
    expect(component.close).toHaveBeenCalled();
  });

  it('should display mat-icon buttons', () => {
    const iconButtons = fixture.nativeElement.querySelectorAll('mat-icon');
    expect(iconButtons.length).toBeGreaterThan(0);
  });

  it('should not display updatedAt card when updatedAt is undefined', () => {
    const { updatedAt, ...contactWithoutUpdate } = mockContact;
    component.data = contactWithoutUpdate as Contact;
    fixture.detectChanges();
    const allText = fixture.nativeElement.textContent;
    // The "Last Updated" text should not appear when updatedAt is undefined due to @if directive
    const hasLastUpdated = allText.includes('Last Updated');
    expect(hasLastUpdated).toBe(false);
  });

  it('should display updatedAt card when updatedAt is defined', () => {
    component.data = { ...mockContact, updatedAt: '2024-03-15T14:30:00Z' };
    fixture.detectChanges();
    const allText = fixture.nativeElement.textContent;
    expect(allText).toContain('Last Updated');
  });
});
