import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { VotingListComponent } from './voting-list.component';
import { DishVoteService } from '@/app/service/dish-vote.service';
import { DishVote } from '@/types/dish-vote.type';

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
