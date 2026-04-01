import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { VotingListComponent } from './voting-list.component';
import { DishVoteService } from '@/app/service/dish-vote.service';
import { DishVote } from '@/types/dish-vote.type';

describe('VotingListComponent', () => {
  let component: VotingListComponent;
  let fixture: ComponentFixture<VotingListComponent>;
  let dishVoteService: jasmine.SpyObj<DishVoteService>;
  let router: Router;

  const mockVotingSession: DishVote = {
    _id: '12345',
    title: 'Test Voting Session',
    description: 'Test description',
    dishVoteItems: [
      {
        slug: 'test-dish',
        customTitle: 'Test Dish',
        voteUser: ['user1'],
        voteAnonymous: ['anonymous1'],
        isCustom: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user1',
    updatedBy: 'user1',
    deleted: false
  };

  beforeEach(async () => {
    const dishVoteServiceSpy = jasmine.createSpyObj('DishVoteService', ['findAll']);

    await TestBed.configureTestingModule({
      imports: [
        VotingListComponent,
        RouterModule.forRoot([]),
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DishVoteService, useValue: dishVoteServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ keyword: '', page: '1' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VotingListComponent);
    component = fixture.componentInstance;
    dishVoteService = TestBed.inject(DishVoteService) as jasmine.SpyObj<DishVoteService>;
    router = TestBed.inject(Router);

    dishVoteService.findAll.and.returnValue(of({
      data: [mockVotingSession],
      count: 1
    }));
  });

  // ---- Creation ----------------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load voting sessions on init', () => {
    fixture.detectChanges();
    expect(dishVoteService.findAll).toHaveBeenCalled();
    expect(component.votingSessions().length).toBe(1);
    expect(component.total()).toBe(1);
  });

  // ---- getTotalVotes -----------------------------------------------------

  it('should calculate total votes correctly', () => {
    const totalVotes = component.getTotalVotes(mockVotingSession);
    expect(totalVotes).toBe(2); // 1 user vote + 1 anonymous vote
  });

  it('should calculate zero votes for empty session', () => {
    const emptySession: DishVote = { ...mockVotingSession, dishVoteItems: [] };
    expect(component.getTotalVotes(emptySession)).toBe(0);
  });

  it('should handle items with undefined voteUser / voteAnonymous', () => {
    const session: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [{ slug: 's', customTitle: 'c', voteUser: undefined as any, voteAnonymous: undefined as any, isCustom: false }],
    };
    expect(component.getTotalVotes(session)).toBe(0);
  });

  it('should sum all votes across multiple items', () => {
    const session: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [
        { slug: 'd1', customTitle: 'D1', voteUser: ['u1'], voteAnonymous: [], isCustom: false },
        { slug: 'd2', customTitle: 'D2', voteUser: ['u1', 'u2'], voteAnonymous: ['a1'], isCustom: false },
        { slug: 'd3', customTitle: 'D3', voteUser: ['u1'], voteAnonymous: ['a1'], isCustom: false },
      ],
    };
    expect(component.getTotalVotes(session)).toBe(6);
  });

  // ---- getMostVotedDish --------------------------------------------------

  it('should identify most voted dish', () => {
    const mostVoted = component.getMostVotedDish(mockVotingSession);
    expect(mostVoted).toBeTruthy();
    expect(mostVoted?.slug).toBe('test-dish');
    expect(mostVoted?.customTitle).toBe('Test Dish');
    expect(mostVoted?.votes).toBe(2);
  });

  it('should return null when no dishes are voted', () => {
    const emptySession: DishVote = { ...mockVotingSession, dishVoteItems: [] };
    expect(component.getMostVotedDish(emptySession)).toBeNull();
  });

  it('should handle multiple dishes with different vote counts', () => {
    const multiDishSession: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [
        { slug: 'dish-1', customTitle: 'Dish 1', voteUser: ['user1'], voteAnonymous: [], isCustom: false },
        { slug: 'dish-2', customTitle: 'Dish 2', voteUser: ['user1', 'user2'], voteAnonymous: ['anon1'], isCustom: false },
        { slug: 'dish-3', customTitle: 'Dish 3', voteUser: ['user1'], voteAnonymous: ['anon1'], isCustom: false }
      ]
    };
    const mostVoted = component.getMostVotedDish(multiDishSession);
    expect(mostVoted?.slug).toBe('dish-2');
    expect(mostVoted?.votes).toBe(3);
    expect(component.getTotalVotes(multiDishSession)).toBe(6);
  });

  it('should return null when all dishes have zero votes', () => {
    const session: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [
        { slug: 'd1', customTitle: 'D1', voteUser: [], voteAnonymous: [], isCustom: false },
        { slug: 'd2', customTitle: 'D2', voteUser: [], voteAnonymous: [], isCustom: false },
      ],
    };
    expect(component.getMostVotedDish(session)).toBeNull();
  });

  it('should include the votes count on the returned item', () => {
    const session: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [
        { slug: 'w', customTitle: 'W', voteUser: ['u1', 'u2', 'u3'], voteAnonymous: [], isCustom: false },
      ],
    };
    const mostVoted = component.getMostVotedDish(session);
    expect(mostVoted?.votes).toBe(3);
  });

  // ---- hasCustomDishes ---------------------------------------------------

  it('should detect custom dishes', () => {
    const sessionWithCustomDish: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [{ ...mockVotingSession.dishVoteItems[0], isCustom: true }]
    };
    expect(component.hasCustomDishes(sessionWithCustomDish)).toBe(true);
    expect(component.hasCustomDishes(mockVotingSession)).toBe(false);
  });

  it('should return false when dishVoteItems is empty', () => {
    const emptySession: DishVote = { ...mockVotingSession, dishVoteItems: [] };
    expect(component.hasCustomDishes(emptySession)).toBeFalse();
  });

  it('should return true even with one custom dish among many non-custom', () => {
    const session: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [
        { slug: 'a', customTitle: '', voteUser: [], voteAnonymous: [], isCustom: false },
        { slug: 'b', customTitle: 'custom', voteUser: [], voteAnonymous: [], isCustom: true },
      ],
    };
    expect(component.hasCustomDishes(session)).toBeTrue();
  });

  // ---- formatDate --------------------------------------------------------

  it('should format date correctly', () => {
    const testDate = new Date('2024-01-01T12:00:00Z');
    expect(component.formatDate(testDate)).toContain('2024');
  });

  it('should format date string correctly', () => {
    const testDateString = '2024-01-01T12:00:00Z';
    const formattedDate = component.formatDate(testDateString);
    expect(formattedDate).toContain('2024');
    expect(formattedDate).toContain('Jan');
  });

  it('should accept both Date object and ISO string and produce consistent output', () => {
    const iso = '2025-06-15T10:30:00Z';
    const dateObj = new Date(iso);
    expect(component.formatDate(iso)).toBe(component.formatDate(dateObj));
  });

  // ---- onSearch ----------------------------------------------------------

  it('should handle search', () => {
    spyOn(component, 'loadVotingSessions');
    component.onSearch('test keyword');
    expect(component.keyword()).toBe('test keyword');
    expect(component.currentPage()).toBe(1);
    expect(component.loadVotingSessions).toHaveBeenCalled();
  });

  it('should reset to page 1 when searching', () => {
    component.currentPage.set(5);
    component.onSearch('new keyword');
    expect(component.currentPage()).toBe(1);
  });

  it('should handle empty keyword search', () => {
    spyOn(component, 'loadVotingSessions');
    component.onSearch('');
    expect(component.keyword()).toBe('');
    expect(component.loadVotingSessions).toHaveBeenCalled();
  });

  // ---- onPageChange ------------------------------------------------------

  it('should handle page change', () => {
    spyOn(component, 'loadVotingSessions');
    component.onPageChange({ pageIndex: 2, pageSize: 20, length: 100 });
    expect(component.currentPage()).toBe(3);
    expect(component.limit()).toBe(20);
    expect(component.loadVotingSessions).toHaveBeenCalled();
  });

  it('should update limit when page size changes', () => {
    component.onPageChange({ pageIndex: 0, pageSize: 50, length: 200 });
    expect(component.limit()).toBe(50);
  });

  it('should map pageIndex 0 to currentPage 1', () => {
    component.onPageChange({ pageIndex: 0, pageSize: 10, length: 50 });
    expect(component.currentPage()).toBe(1);
  });

  // ---- loadVotingSessions ------------------------------------------------

  it('should set loading to true then false during load', () => {
    const loadingStates: boolean[] = [];
    dishVoteService.findAll.and.callFake(() => {
      loadingStates.push(component.loading());
      return of({ data: [], count: 0 });
    });
    component.loadVotingSessions();
    expect(loadingStates[0]).toBeTrue();
    expect(component.loading()).toBeFalse();
  });

  it('should set loading to false on error', () => {
    dishVoteService.findAll.and.returnValue(throwError(() => new Error('fail')));
    component.loadVotingSessions();
    expect(component.loading()).toBeFalse();
  });

  it('should use current keyword and pagination in the request dto', () => {
    dishVoteService.findAll.calls.reset();
    component.keyword.set('pizza');
    component.currentPage.set(3);
    component.limit.set(25);
    component.loadVotingSessions();
    expect(dishVoteService.findAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ keyword: 'pizza', page: 3, limit: 25 })
    );
  });

  it('should not update votingSessions on error', () => {
    fixture.detectChanges(); // loads 1 session
    dishVoteService.findAll.and.returnValue(throwError(() => new Error('fail')));
    component.loadVotingSessions();
    // sessions should remain from previous successful load
    expect(component.votingSessions().length).toBe(1);
  });

  // ---- navigateToVotingSession ------------------------------------------

  it('should navigate to voting session', () => {
    spyOn(router, 'navigate');
    component.navigateToVotingSession('abc-123');
    expect(router.navigate).toHaveBeenCalledWith(['/game/voting', 'abc-123']);
  });

  // ---- createNewVotingSession -------------------------------------------

  it('should navigate to create voting session', () => {
    spyOn(router, 'navigate');
    component.createNewVotingSession();
    expect(router.navigate).toHaveBeenCalledWith(['/game/voting/create']);
  });

  // ---- goBack ------------------------------------------------------------

  it('should navigate to root on goBack', () => {
    spyOn(router, 'navigate');
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  // ---- Template ----------------------------------------------------------

  describe('template', () => {
    it('should show progress spinner when loading', () => {
      dishVoteService.findAll.and.returnValue(of({ data: [], count: 0 }));
      fixture.detectChanges(); // run ngOnInit (loading ends synchronously)
      component.loading.set(true); // manually assert loading state
      fixture.detectChanges(); // re-render with loading = true
      const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
      expect(spinner).not.toBeNull();
    });

    it('should show empty state when no sessions and not loading', () => {
      dishVoteService.findAll.and.returnValue(of({ data: [], count: 0 }));
      fixture.detectChanges();
      const empty = fixture.debugElement.query(By.css('app-empty'));
      expect(empty).not.toBeNull();
    });

    it('should render one mat-card per voting session', () => {
      const sessions = [
        { ...mockVotingSession, _id: 'a' },
        { ...mockVotingSession, _id: 'b' },
      ];
      dishVoteService.findAll.and.returnValue(of({ data: sessions, count: 2 }));
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('mat-card'));
      expect(cards.length).toBe(2);
    });

    it('should display session title in card', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Test Voting Session');
    });

    it('should call navigateToVotingSession when card is clicked', () => {
      spyOn(component, 'navigateToVotingSession');
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('mat-card'));
      card.triggerEventHandler('click', null);
      expect(component.navigateToVotingSession).toHaveBeenCalledWith('12345');
    });

    it('should call goBack when Back button is clicked', () => {
      spyOn(component, 'goBack');
      fixture.detectChanges();
      const backBtn = fixture.debugElement.query(By.css('button[matbutton="elevated"]'));
      backBtn.triggerEventHandler('click', null);
      expect(component.goBack).toHaveBeenCalled();
    });

    it('should call createNewVotingSession when FAB is clicked', () => {
      spyOn(component, 'createNewVotingSession');
      fixture.detectChanges();
      const fabBtn = fixture.debugElement.query(By.css('button[matFab]'));
      fabBtn.triggerEventHandler('click', null);
      expect(component.createNewVotingSession).toHaveBeenCalled();
    });

    it('should not show spinner when not loading', () => {
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
      expect(spinner).toBeNull();
    });
  });
});

describe('VotingListComponent', () => {
  let component: VotingListComponent;
  let fixture: ComponentFixture<VotingListComponent>;
  let dishVoteService: jasmine.SpyObj<DishVoteService>;

  const mockVotingSession: DishVote = {
    _id: '12345',
    title: 'Test Voting Session',
    description: 'Test description',
    dishVoteItems: [
      {
        slug: 'test-dish',
        customTitle: 'Test Dish',
        voteUser: ['user1'],
        voteAnonymous: ['anonymous1'],
        isCustom: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user1',
    updatedBy: 'user1',
    deleted: false
  };

  beforeEach(async () => {
    const dishVoteServiceSpy = jasmine.createSpyObj('DishVoteService', ['findAll']);

    await TestBed.configureTestingModule({
      imports: [
        VotingListComponent,
        RouterModule.forRoot([]),
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DishVoteService, useValue: dishVoteServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ keyword: '', page: '1' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VotingListComponent);
    component = fixture.componentInstance;
    dishVoteService = TestBed.inject(DishVoteService) as jasmine.SpyObj<DishVoteService>;
    
    dishVoteService.findAll.and.returnValue(of({
      data: [mockVotingSession],
      count: 1
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load voting sessions on init', () => {
    fixture.detectChanges();
    expect(dishVoteService.findAll).toHaveBeenCalled();
    expect(component.votingSessions().length).toBe(1);
    expect(component.total()).toBe(1);
  });

  it('should calculate total votes correctly', () => {
    const totalVotes = component.getTotalVotes(mockVotingSession);
    expect(totalVotes).toBe(2); // 1 user vote + 1 anonymous vote
  });

  it('should identify most voted dish', () => {
    const mostVoted = component.getMostVotedDish(mockVotingSession);
    expect(mostVoted).toBeTruthy();
    expect(mostVoted?.slug).toBe('test-dish');
    expect(mostVoted?.customTitle).toBe('Test Dish');
    expect(mostVoted?.votes).toBe(2);
  });

  it('should detect custom dishes', () => {
    const sessionWithCustomDish: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [
        {
          ...mockVotingSession.dishVoteItems[0],
          isCustom: true
        }
      ]
    };
    
    expect(component.hasCustomDishes(sessionWithCustomDish)).toBe(true);
    expect(component.hasCustomDishes(mockVotingSession)).toBe(false);
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-01-01T12:00:00Z');
    const formattedDate = component.formatDate(testDate);
    expect(formattedDate).toContain('2024');
  });

  it('should format date string correctly', () => {
    const testDateString = '2024-01-01T12:00:00Z';
    const formattedDate = component.formatDate(testDateString);
    expect(formattedDate).toContain('2024');
    expect(formattedDate).toContain('Jan');
  });

  it('should handle search', () => {
    spyOn(component, 'loadVotingSessions');
    component.onSearch('test keyword');
    
    expect(component.keyword()).toBe('test keyword');
    expect(component.currentPage()).toBe(1);
    expect(component.loadVotingSessions).toHaveBeenCalled();
  });

  it('should handle page change', () => {
    spyOn(component, 'loadVotingSessions');
    const pageEvent = { pageIndex: 2, pageSize: 20, length: 100 };
    
    component.onPageChange(pageEvent);
    
    expect(component.currentPage()).toBe(3); // pageIndex + 1
    expect(component.limit()).toBe(20);
    expect(component.loadVotingSessions).toHaveBeenCalled();
  });

  it('should return null when no dishes are voted', () => {
    const emptySession: DishVote = {
      ...mockVotingSession,
      dishVoteItems: []
    };
    
    const mostVoted = component.getMostVotedDish(emptySession);
    expect(mostVoted).toBeNull();
  });

  it('should calculate zero votes for empty session', () => {
    const emptySession: DishVote = {
      ...mockVotingSession,
      dishVoteItems: []
    };
    
    const totalVotes = component.getTotalVotes(emptySession);
    expect(totalVotes).toBe(0);
  });

  it('should handle multiple dishes with different vote counts', () => {
    const multiDishSession: DishVote = {
      ...mockVotingSession,
      dishVoteItems: [
        {
          slug: 'dish-1',
          customTitle: 'Dish 1',
          voteUser: ['user1'],
          voteAnonymous: [],
          isCustom: false
        },
        {
          slug: 'dish-2',
          customTitle: 'Dish 2',
          voteUser: ['user1', 'user2'],
          voteAnonymous: ['anon1'],
          isCustom: false
        },
        {
          slug: 'dish-3',
          customTitle: 'Dish 3',
          voteUser: ['user1'],
          voteAnonymous: ['anon1'],
          isCustom: false
        }
      ]
    };
    
    const mostVoted = component.getMostVotedDish(multiDishSession);
    expect(mostVoted?.slug).toBe('dish-2');
    expect(mostVoted?.votes).toBe(3);
    
    const totalVotes = component.getTotalVotes(multiDishSession);
    expect(totalVotes).toBe(6); // 1 + 3 + 2
  });

  it('should reset to page 1 when searching', () => {
    component.currentPage.set(5);
    component.onSearch('new keyword');
    
    expect(component.currentPage()).toBe(1);
  });

  it('should handle empty keyword search', () => {
    spyOn(component, 'loadVotingSessions');
    component.onSearch('');
    
    expect(component.keyword()).toBe('');
    expect(component.loadVotingSessions).toHaveBeenCalled();
  });
});
