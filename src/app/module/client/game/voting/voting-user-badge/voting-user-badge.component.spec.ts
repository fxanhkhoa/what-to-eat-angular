import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { VotingUserBadgeComponent } from './voting-user-badge.component';
import { UserService } from '@/app/service/user.service';
import { COLOR_PALETTE } from '@/constant/color.constant';

// A valid 24-char hex ObjectId
const OBJECT_ID = '507f1f77bcf86cd799439011';
const COLORS = COLOR_PALETTE.slice(0, 9);

describe('VotingUserBadgeComponent', () => {
  let component: VotingUserBadgeComponent;
  let fixture: ComponentFixture<VotingUserBadgeComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['findOne']);
    userService.findOne.and.returnValue(of({ name: 'Alice' } as any));

    await TestBed.configureTestingModule({
      imports: [VotingUserBadgeComponent],
      providers: [{ provide: UserService, useValue: userService }],
    }).compileComponents();

    fixture = TestBed.createComponent(VotingUserBadgeComponent);
    component = fixture.componentInstance;
  });

  // ---- creation -----------------------------------------------------------

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default voterName ""', () => {
    expect(component.voterName).toBe('');
  });

  it('should have default index 0', () => {
    expect(component.index).toBe(0);
  });

  it('should slice COLOR_PALETTE to 9 colors', () => {
    expect(component.colors.length).toBe(9);
    expect(component.colors).toEqual(COLORS);
  });

  // ---- randomColor signal -------------------------------------------------

  describe('randomColor signal', () => {
    it('should initialise to colors[index % 9] before ngOnInit', () => {
      component.index = 0;
      expect(component.randomColor()).toBe(COLORS[0]);
    });

    it('should wrap around when index >= 9', () => {
      component.index = 9;
      fixture.detectChanges();
      expect(component.randomColor()).toBe(COLORS[9 % 9]); // index 0
    });

    it('should set correct color for index 3', () => {
      component.index = 3;
      fixture.detectChanges();
      expect(component.randomColor()).toBe(COLORS[3]);
    });

    it('should set correct color for index 10', () => {
      component.index = 10;
      fixture.detectChanges();
      expect(component.randomColor()).toBe(COLORS[10 % 9]);
    });
  });

  // ---- name signal --------------------------------------------------------

  describe('name signal', () => {
    it('should initialise to empty string (default voterName at construction time)', () => {
      // name signal is initialized with this.voterName at field init (construction)
      expect(component.name()).toBe('');
    });

    it('should remain unchanged after ngOnInit when voterName is not an ObjectId', () => {
      component.voterName = 'Charlie';
      fixture.detectChanges(); // triggers ngOnInit — no ObjectId, so name stays ''
      expect(component.name()).toBe('');
    });
  });

  // ---- ngOnInit -----------------------------------------------------------

  describe('ngOnInit', () => {
    it('should not call getUserById when voterName is not an ObjectId', () => {
      component.voterName = 'not-an-id';
      fixture.detectChanges();
      expect(userService.findOne).not.toHaveBeenCalled();
    });

    it('should not call getUserById when voterName is empty string', () => {
      component.voterName = '';
      fixture.detectChanges();
      expect(userService.findOne).not.toHaveBeenCalled();
    });

    it('should call getUserById when voterName is a valid ObjectId', () => {
      component.voterName = OBJECT_ID;
      fixture.detectChanges();
      expect(userService.findOne).toHaveBeenCalledWith(OBJECT_ID);
    });

    it('should update name signal from fetched user', () => {
      userService.findOne.and.returnValue(of({ name: 'Diana' } as any));
      component.voterName = OBJECT_ID;
      fixture.detectChanges();
      expect(component.name()).toBe('Diana');
    });

    it('should set name to "Anonymous" when user.name is null', () => {
      userService.findOne.and.returnValue(of({ name: null } as any));
      component.voterName = OBJECT_ID;
      fixture.detectChanges();
      expect(component.name()).toBe('Anonymous');
    });

    it('should set name to "Anonymous" when user.name is undefined', () => {
      userService.findOne.and.returnValue(of({} as any));
      component.voterName = OBJECT_ID;
      fixture.detectChanges();
      expect(component.name()).toBe('Anonymous');
    });

    it('should update randomColor in ngOnInit based on index', () => {
      component.index = 5;
      component.voterName = 'Eve';
      fixture.detectChanges();
      expect(component.randomColor()).toBe(COLORS[5]);
    });
  });

  // ---- getUserById() ------------------------------------------------------

  describe('getUserById()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should call userService.findOne with the given id', () => {
      userService.findOne.calls.reset();
      component.getUserById('some-id');
      expect(userService.findOne).toHaveBeenCalledWith('some-id');
    });

    it('should update name signal with the returned user name', () => {
      userService.findOne.and.returnValue(of({ name: 'Frank' } as any));
      component.getUserById('some-id');
      expect(component.name()).toBe('Frank');
    });

    it('should fall back to "Anonymous" when user.name is null', () => {
      userService.findOne.and.returnValue(of({ name: null } as any));
      component.getUserById('some-id');
      expect(component.name()).toBe('Anonymous');
    });

    it('should fall back to "Anonymous" when user.name is undefined', () => {
      userService.findOne.and.returnValue(of({} as any));
      component.getUserById('some-id');
      expect(component.name()).toBe('Anonymous');
    });
  });

  // ---- template -----------------------------------------------------------

  describe('template', () => {
    it('should render a div with the current name signal value', () => {
      fixture.detectChanges();
      component.name.set('Grace');
      fixture.detectChanges();
      const div = fixture.debugElement.query(By.css('div'));
      expect(div.nativeElement.textContent.trim()).toBe('Grace');
    });

    it('should apply background-color style from randomColor signal', () => {
      component.index = 2;
      fixture.detectChanges();
      const div = fixture.debugElement.query(By.css('div'));
      expect(div.nativeElement.style.backgroundColor).toBeTruthy();
    });

    it('should update displayed name after getUserById resolves', () => {
      userService.findOne.and.returnValue(of({ name: 'Hank' } as any));
      component.voterName = OBJECT_ID;
      fixture.detectChanges();
      const div = fixture.debugElement.query(By.css('div'));
      expect(div.nativeElement.textContent.trim()).toBe('Hank');
    });
  });
});
