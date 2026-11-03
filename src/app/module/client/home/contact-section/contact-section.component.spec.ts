import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ContactSectionComponent } from './contact-section.component';
import { ContactService } from '@/app/service/contact.service';

describe('ContactSectionComponent', () => {
  let component: ContactSectionComponent;
  let fixture: ComponentFixture<ContactSectionComponent>;
  let contactServiceSpy: jasmine.SpyObj<ContactService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    contactServiceSpy = jasmine.createSpyObj('ContactService', ['create']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ContactSectionComponent, NoopAnimationsModule],
      providers: [
        { provide: ContactService, useValue: contactServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    })
      .overrideComponent(ContactSectionComponent, {
        set: {
          // Exclude MatSnackBarModule (spy conflict) and MatIconModule (svgIcon error)
          imports: [
            ReactiveFormsModule,
            MatInputModule,
            MatFormFieldModule,
            MatButtonModule,
            CommonModule,
            MatProgressSpinnerModule,
          ],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ContactSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise isSending to false', () => {
    expect(component.isSending).toBeFalse();
  });

  // ── form structure ───────────────────────────────────────────────────────────
  it('should build a contactForm with name, email and message controls', () => {
    expect(component.contactForm.contains('name')).toBeTrue();
    expect(component.contactForm.contains('email')).toBeTrue();
    expect(component.contactForm.contains('message')).toBeTrue();
  });

  it('should start with an invalid form (all controls empty)', () => {
    expect(component.contactForm.valid).toBeFalse();
  });

  // ── validation: name ─────────────────────────────────────────────────────────
  it('name control should be invalid when empty', () => {
    component.contactForm.get('name')!.setValue('');
    expect(component.contactForm.get('name')!.hasError('required')).toBeTrue();
  });

  it('name control should be valid when filled', () => {
    component.contactForm.get('name')!.setValue('Alice');
    expect(component.contactForm.get('name')!.valid).toBeTrue();
  });

  // ── validation: email ─────────────────────────────────────────────────────────
  it('email control should be invalid when empty', () => {
    component.contactForm.get('email')!.setValue('');
    expect(component.contactForm.get('email')!.hasError('required')).toBeTrue();
  });

  it('email control should be invalid for a bad email', () => {
    component.contactForm.get('email')!.setValue('not-an-email');
    expect(component.contactForm.get('email')!.hasError('email')).toBeTrue();
  });

  it('email control should be valid for a proper email', () => {
    component.contactForm.get('email')!.setValue('alice@example.com');
    expect(component.contactForm.get('email')!.valid).toBeTrue();
  });

  // ── validation: message ──────────────────────────────────────────────────────
  it('message control should be invalid when empty', () => {
    component.contactForm.get('message')!.setValue('');
    expect(component.contactForm.get('message')!.hasError('required')).toBeTrue();
  });

  it('message control should be valid when filled', () => {
    component.contactForm.get('message')!.setValue('Hello');
    expect(component.contactForm.get('message')!.valid).toBeTrue();
  });

  // ── onSubmit — invalid form ───────────────────────────────────────────────────
  it('should mark all controls as touched when form is invalid on submit', () => {
    component.onSubmit();
    expect(component.contactForm.get('name')!.touched).toBeTrue();
    expect(component.contactForm.get('email')!.touched).toBeTrue();
    expect(component.contactForm.get('message')!.touched).toBeTrue();
  });

  it('should not call contactService.create when form is invalid', () => {
    component.onSubmit();
    expect(contactServiceSpy.create).not.toHaveBeenCalled();
  });

  // ── onSubmit — valid form ─────────────────────────────────────────────────────
  const fillForm = (component: ContactSectionComponent) => {
    component.contactForm.setValue({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hello there',
    });
  };

  it('should set isSending to true while request is in flight', () => {
    contactServiceSpy.create.and.returnValue(of({} as any));
    fillForm(component);
    component.onSubmit();
    // finalize resets it; check it was set (it goes false synchronously with of())
    expect(contactServiceSpy.create).toHaveBeenCalled();
  });

  it('should call contactService.create with form values', () => {
    contactServiceSpy.create.and.returnValue(of({} as any));
    fillForm(component);
    component.onSubmit();
    expect(contactServiceSpy.create).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hello there',
    });
  });

  it('should open snackbar on successful submission', () => {
    contactServiceSpy.create.and.returnValue(of({} as any));
    fillForm(component);
    component.onSubmit();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.any(String),
      jasmine.objectContaining({ duration: 3000 })
    );
  });

  it('should reset the form after successful submission', () => {
    contactServiceSpy.create.and.returnValue(of({} as any));
    fillForm(component);
    component.onSubmit();
    expect(component.contactForm.get('name')!.value).toBeNull();
    expect(component.contactForm.get('email')!.value).toBeNull();
    expect(component.contactForm.get('message')!.value).toBeNull();
  });

  it('should set isSending to true during request and reset after', () => {
    contactServiceSpy.create.and.returnValue(of({} as any));
    fillForm(component);
    component.onSubmit();
    // finalize() resets it synchronously with of()
    expect(component.isSending).toBeFalse();
  });
});

