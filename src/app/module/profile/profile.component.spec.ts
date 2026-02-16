import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize profile form with empty values', () => {
    expect(component.profileForm).toBeDefined();
    expect(component.profileForm.get('name')).toBeDefined();
    expect(component.profileForm.get('email')).toBeDefined();
  });

  it('should toggle edit mode', () => {
    const initialEditState = component.isEditing();
    component.toggleEdit();
    expect(component.isEditing()).toBe(!initialEditState);
  });

  it('should validate required name field', () => {
    const nameControl = component.profileForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);
    
    nameControl?.setValue('John Doe');
    expect(nameControl?.hasError('required')).toBe(false);
  });

  it('should validate email format', () => {
    const emailControl = component.profileForm.get('email');
    emailControl?.enable();
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate phone number pattern', () => {
    const phoneControl = component.profileForm.get('phone');
    phoneControl?.setValue('123');
    expect(phoneControl?.hasError('pattern')).toBe(true);
    
    phoneControl?.setValue('1234567890');
    expect(phoneControl?.hasError('pattern')).toBe(false);
  });
});
