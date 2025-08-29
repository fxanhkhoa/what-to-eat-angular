import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
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
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
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
    expect(mostVoted).toEqual({
      slug: 'test-dish',
      title: 'Test Dish',
      votes: 2
    });
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
});
