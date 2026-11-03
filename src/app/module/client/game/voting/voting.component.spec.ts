import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, BehaviorSubject, throwError } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

import { VotingComponent } from './voting.component';
import { SocketService } from '@/app/service/socket.service';
import { DishVoteService } from '@/app/service/dish-vote.service';
import { DishService } from '@/app/service/dish.service';
import { AuthService } from '@/app/service/auth.service';
import { DishVote, DishVoteItem } from '@/types/dish-vote.type';
import { Dish } from '@/types/dish.type';
import { User } from '@/types/user.type';

// ── Stubs ────────────────────────────────────────────────────────────────────

@Component({ selector: 'app-dish-card-fancy', template: '', standalone: true })
class DishCardFancyStub {
  @Input() dish: any;
  @Input() isWinner = false;
}

@Component({ selector: 'app-voting-user-badge', template: '', standalone: true })
class VotingUserBadgeStub {
  @Input() voterName = '';
  @Input() index = 0;
}

@Component({ selector: 'app-voting-chat', template: '', standalone: true })
class VotingChatStub {
  @Input() roomId = '';
  @Output() resetPosition = new EventEmitter<void>();
}

const STUB_IMPORTS = [
  CommonModule,
  FormsModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatCardModule,
  MatDividerModule,
  MatBadgeModule,
  DishCardFancyStub,
  VotingUserBadgeStub,
  VotingChatStub,
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDish(slug: string, titleEn = 'Dish ' + slug): Dish {
  return {
    _id: slug + '-id',
    slug,
    title: [{ lang: 'en', data: titleEn }],
    shortDescription: [{ lang: 'en', data: 'A short description' }],
    content: [],
    tags: [],
    mealCategories: [],
    ingredientCategories: [],
    videos: [],
    ingredients: [],
    relatedDishes: [],
    labels: [],
    deleted: false,
    createdAt: '',
    updatedAt: '',
  } as Dish;
}

function makeUser(id = 'user-1'): User {
  return {
    _id: id,
    email: 'test@example.com',
    roleName: 'user',
    deleted: false,
    createdAt: '',
    updatedAt: '',
  } as User;
}

function makeDishVote(items: DishVoteItem[] = [
  { slug: 'pho', voteUser: ['user-1'], voteAnonymous: [], isCustom: false },
  { slug: 'bun-bo', voteUser: [], voteAnonymous: ['anon-1', 'anon-2'], isCustom: false },
]): DishVote {
  return {
    _id: 'vote-123',
    title: 'Best lunch?',
    description: '',
    dishVoteItems: items,
    deleted: false,
    createdAt: '',
    updatedAt: '',
  } as DishVote;
}

// ── Main describe ─────────────────────────────────────────────────────────────

describe('VotingComponent', () => {
  let component: VotingComponent;
  let fixture: ComponentFixture<VotingComponent>;

  let socketServiceSpy: jasmine.SpyObj<SocketService>;
  let dishVoteServiceSpy: jasmine.SpyObj<DishVoteService>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const dishVoteUpdate$ = new Subject<DishVote>();
  const connectionState$ = new BehaviorSubject<string>('disconnected');

  beforeEach(async () => {
    socketServiceSpy = jasmine.createSpyObj('SocketService', [
      'connect', 'disconnect', 'joinRoom', 'onDishVoteUpdate',
      'getConnectionState', 'emitDishVoteUpdate',
    ]);
    socketServiceSpy.onDishVoteUpdate.and.returnValue(dishVoteUpdate$.asObservable());
    socketServiceSpy.getConnectionState.and.returnValue(connectionState$.asObservable());

    dishVoteServiceSpy = jasmine.createSpyObj('DishVoteService', ['findById']);
    dishVoteServiceSpy.findById.and.returnValue(of(makeDishVote()));

    dishServiceSpy = jasmine.createSpyObj('DishService', ['findBySlug']);
    dishServiceSpy.findBySlug.and.callFake((slug: string) =>
      of(makeDish(slug))
    );

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    authServiceSpy.getProfile.and.returnValue(of(makeUser()));

    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [VotingComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: SocketService, useValue: socketServiceSpy },
        { provide: DishVoteService, useValue: dishVoteServiceSpy },
        { provide: DishService, useValue: dishServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: 'vote-123' } } },
        },
      ],
    })
      .overrideComponent(VotingComponent, { set: { imports: STUB_IMPORTS } })
      .compileComponents();

    const registry = TestBed.inject(MatIconRegistry);
    spyOn(registry, 'getDefaultFontSetClass').and.returnValue(['material-icons']);

    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set dishVoteID from route params', () => {
      expect(component.dishVoteID).toBe('vote-123');
    });

    it('should call socket connect and joinRoom', () => {
      expect(socketServiceSpy.connect).toHaveBeenCalled();
      expect(socketServiceSpy.joinRoom).toHaveBeenCalledWith('vote-123');
    });

    it('should call loadData and populate dishes', () => {
      expect(dishVoteServiceSpy.findById).toHaveBeenCalledWith('vote-123');
      expect(component.dishes.length).toBe(2);
    });

    it('should call loadProfile and set profile signal', () => {
      expect(authServiceSpy.getProfile).toHaveBeenCalled();
      expect(component.profile()).toEqual(makeUser());
    });
  });

  // ── ngOnDestroy ─────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call socketService.disconnect', () => {
      component.ngOnDestroy();
      expect(socketServiceSpy.disconnect).toHaveBeenCalled();
    });

    it('should remove canonical link element', () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      component.ngOnDestroy();
      expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    });
  });

  // ── loadData ────────────────────────────────────────────────────────────────

  describe('loadData', () => {
    it('should set loading=false after successful load', () => {
      expect(component.loading).toBeFalse();
    });

    it('should set error=null on success', () => {
      expect(component.error).toBeNull();
    });

    it('should set error message on failure', () => {
      dishVoteServiceSpy.findById.and.returnValue(throwError(() => new Error('fail')));
      component.loadData();
      expect(component.error).toBe('Failed to load voting data');
    });

    it('should skip dishService calls for items with customTitle', () => {
      dishVoteServiceSpy.findById.and.returnValue(
        of(makeDishVote([
          { slug: 'custom-1', voteUser: [], voteAnonymous: [], isCustom: true,
            customTitle: 'My Custom Dish' } as any,
        ]))
      );
      dishServiceSpy.findBySlug.calls.reset();
      component.loadData();
      expect(dishServiceSpy.findBySlug).not.toHaveBeenCalled();
    });

    it('should handle dishService errors gracefully using catchError', () => {
      dishVoteServiceSpy.findById.and.returnValue(of(makeDishVote([
        { slug: 'pho', voteUser: [], voteAnonymous: [], isCustom: false },
      ])));
      dishServiceSpy.findBySlug.and.returnValue(throwError(() => new Error('not found')));
      component.loadData();
      expect(component.dishes.length).toBe(0);
      expect(component.loading).toBeFalse();
    });
  });

  // ── socket updates ──────────────────────────────────────────────────────────

  describe('socket updates', () => {
    it('should update dishVote when onDishVoteUpdate emits', () => {
      const updatedVote = makeDishVote([
        { slug: 'pho', voteUser: ['user-1', 'user-2'], voteAnonymous: [], isCustom: false },
      ]);
      dishVoteUpdate$.next(updatedVote);
      expect(component.dishVote).toEqual(updatedVote);
    });

    it('should update connectionState signal when socket state changes', () => {
      connectionState$.next('connected');
      expect(component.connectionState()).toBe('connected');
    });
  });

  // ── onVote ──────────────────────────────────────────────────────────────────

  describe('onVote', () => {
    it('should do nothing when profile is null', () => {
      component.profile.set(null);
      component.onVote(makeDish('pho'));
      expect(socketServiceSpy.emitDishVoteUpdate).not.toHaveBeenCalled();
    });

    it('should do nothing when dishVote is null', () => {
      component.dishVote = null;
      component.onVote(makeDish('pho'));
      expect(socketServiceSpy.emitDishVoteUpdate).not.toHaveBeenCalled();
    });

    it('should emit vote with isVoting=true when not already voted', () => {
      // user-1 has already voted for pho above, reset to no vote
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: [], voteAnonymous: [], isCustom: false },
      ]);
      component.profile.set(makeUser('user-1'));
      component.onVote(makeDish('pho'));
      expect(socketServiceSpy.emitDishVoteUpdate).toHaveBeenCalledWith(
        jasmine.objectContaining({ slug: 'pho', isVoting: true }),
        { roomID: 'vote-123' }
      );
    });

    it('should emit vote with isVoting=false when already in voteUser', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['user-1'], voteAnonymous: [], isCustom: false },
      ]);
      component.profile.set(makeUser('user-1'));
      component.onVote(makeDish('pho'));
      expect(socketServiceSpy.emitDishVoteUpdate).toHaveBeenCalledWith(
        jasmine.objectContaining({ slug: 'pho', isVoting: false }),
        { roomID: 'vote-123' }
      );
    });

    it('should emit vote with isVoting=false when already in voteAnonymous', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: [], voteAnonymous: ['user-1'], isCustom: false },
      ]);
      component.profile.set(makeUser('user-1'));
      component.onVote(makeDish('pho'));
      expect(socketServiceSpy.emitDishVoteUpdate).toHaveBeenCalledWith(
        jasmine.objectContaining({ slug: 'pho', isVoting: false }),
        { roomID: 'vote-123' }
      );
    });
  });

  // ── onCustomVote ────────────────────────────────────────────────────────────

  describe('onCustomVote', () => {
    it('should do nothing when profile is null', () => {
      component.profile.set(null);
      component.onCustomVote('custom-slug');
      expect(socketServiceSpy.emitDishVoteUpdate).not.toHaveBeenCalled();
    });

    it('should emit with isVoting=true when not currently voted', () => {
      component.dishVote = makeDishVote([
        { slug: 'custom-slug', voteUser: [], voteAnonymous: [], isCustom: true } as any,
      ]);
      component.profile.set(makeUser('user-1'));
      component.onCustomVote('custom-slug');
      expect(socketServiceSpy.emitDishVoteUpdate).toHaveBeenCalledWith(
        jasmine.objectContaining({ slug: 'custom-slug', isVoting: true }),
        { roomID: 'vote-123' }
      );
    });

    it('should emit with isVoting=false when already voted', () => {
      component.dishVote = makeDishVote([
        { slug: 'custom-slug', voteUser: ['user-1'], voteAnonymous: [], isCustom: true } as any,
      ]);
      component.profile.set(makeUser('user-1'));
      component.onCustomVote('custom-slug');
      expect(socketServiceSpy.emitDishVoteUpdate).toHaveBeenCalledWith(
        jasmine.objectContaining({ slug: 'custom-slug', isVoting: false }),
        { roomID: 'vote-123' }
      );
    });
  });

  // ── getAllMax ────────────────────────────────────────────────────────────────

  describe('getAllMax', () => {
    it('should return [] when dishVote is null', () => {
      component.dishVote = null;
      expect(component.getAllMax()).toEqual([]);
    });

    it('should return the slug(s) with the highest vote count', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['u1', 'u2'], voteAnonymous: [], isCustom: false },
        { slug: 'bun-bo', voteUser: ['u1'], voteAnonymous: [], isCustom: false },
      ]);
      expect(component.getAllMax()).toEqual(['pho']);
    });

    it('should return multiple slugs when tied', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['u1'], voteAnonymous: [], isCustom: false },
        { slug: 'bun-bo', voteUser: ['u2'], voteAnonymous: [], isCustom: false },
      ]);
      expect(component.getAllMax()).toEqual(jasmine.arrayContaining(['pho', 'bun-bo']));
    });

    it('should return [] when all items have 0 votes', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: [], voteAnonymous: [], isCustom: false },
      ]);
      expect(component.getAllMax()).toEqual([]);
    });
  });

  // ── isWinnerDish ─────────────────────────────────────────────────────────────

  describe('isWinnerDish', () => {
    it('should return true for the leading slug', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['u1', 'u2'], voteAnonymous: [], isCustom: false },
        { slug: 'bun-bo', voteUser: ['u1'], voteAnonymous: [], isCustom: false },
      ]);
      expect(component.isWinnerDish('pho')).toBeTrue();
    });

    it('should return false for a non-winning slug', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['u1', 'u2'], voteAnonymous: [], isCustom: false },
        { slug: 'bun-bo', voteUser: ['u1'], voteAnonymous: [], isCustom: false },
      ]);
      expect(component.isWinnerDish('bun-bo')).toBeFalse();
    });
  });

  // ── getWinnerNames ───────────────────────────────────────────────────────────

  describe('getWinnerNames', () => {
    it('should return the dish title for a winning dish', () => {
      component.dishes = [makeDish('pho', 'Beef Pho')];
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['u1', 'u2'], voteAnonymous: [], isCustom: false },
      ]);
      const names = component.getWinnerNames();
      expect(names).toBe('Beef Pho');
    });

    it('should fall back to customTitle when dish is not in dishes array', () => {
      component.dishes = [];
      component.dishVote = makeDishVote([
        { slug: 'my-custom', voteUser: ['u1'], voteAnonymous: [], isCustom: true,
          customTitle: 'My Custom Dish' } as any,
      ]);
      const names = component.getWinnerNames();
      expect(names).toContain('My Custom Dish');
    });
  });

  // ── getDishTitle ─────────────────────────────────────────────────────────────

  describe('getDishTitle', () => {
    it('should return the locale title', () => {
      component.localeID = 'en';
      const dish = makeDish('pho', 'Beef Pho');
      expect(component.getDishTitle(dish)).toBe('Beef Pho');
    });

    it('should return slug when dish is deleted', () => {
      const dish = { ...makeDish('pho', 'Beef Pho'), deleted: true };
      expect(component.getDishTitle(dish)).toBe('pho');
    });

    it('should return slug when locale title not found', () => {
      component.localeID = 'vi';
      const dish = makeDish('pho', 'Beef Pho'); // only has 'en'
      expect(component.getDishTitle(dish)).toBe('pho');
    });
  });

  // ── getDishDescription ───────────────────────────────────────────────────────

  describe('getDishDescription', () => {
    it('should return empty string when dish is deleted', () => {
      const dish = { ...makeDish('pho'), deleted: true };
      expect(component.getDishDescription(dish)).toBe('');
    });

    it('should truncate descriptions longer than 90 characters', () => {
      const longDesc = 'A'.repeat(100);
      const dish = {
        ...makeDish('pho'),
        shortDescription: [{ lang: 'en', data: longDesc }],
      };
      component.localeID = 'en';
      const result = component.getDishDescription(dish);
      expect(result.length).toBeLessThanOrEqual(93); // 90 + '...'
      expect(result.endsWith('...')).toBeTrue();
    });

    it('should not truncate descriptions <= 90 characters', () => {
      const shortDesc = 'Short description';
      const dish = {
        ...makeDish('pho'),
        shortDescription: [{ lang: 'en', data: shortDesc }],
      };
      component.localeID = 'en';
      expect(component.getDishDescription(dish)).toBe(shortDesc);
    });
  });

  // ── isVotedByMe ──────────────────────────────────────────────────────────────

  describe('isVotedByMe', () => {
    it('should return false when dishVote is null', () => {
      component.dishVote = null;
      expect(component.isVotedByMe('pho')).toBeFalse();
    });

    it('should return false when profile is null', () => {
      component.profile.set(null);
      expect(component.isVotedByMe('pho')).toBeFalse();
    });

    it('should return true when user is in voteUser', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['user-1'], voteAnonymous: [], isCustom: false },
      ]);
      component.profile.set(makeUser('user-1'));
      expect(component.isVotedByMe('pho')).toBeTrue();
    });

    it('should return true when user is in voteAnonymous', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: [], voteAnonymous: ['user-1'], isCustom: false },
      ]);
      component.profile.set(makeUser('user-1'));
      expect(component.isVotedByMe('pho')).toBeTrue();
    });

    it('should return false when user has not voted', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['other-user'], voteAnonymous: [], isCustom: false },
      ]);
      component.profile.set(makeUser('user-1'));
      expect(component.isVotedByMe('pho')).toBeFalse();
    });
  });

  // ── getTotalVotes ────────────────────────────────────────────────────────────

  describe('getTotalVotes', () => {
    it('should return 0 when dishVote is null', () => {
      component.dishVote = null;
      expect(component.getTotalVotes('pho')).toBe(0);
    });

    it('should sum voteUser and voteAnonymous', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['u1', 'u2'], voteAnonymous: ['a1'], isCustom: false },
      ]);
      expect(component.getTotalVotes('pho')).toBe(3);
    });

    it('should return 0 for unknown slug', () => {
      expect(component.getTotalVotes('unknown-slug')).toBe(0);
    });
  });

  // ── getVotersList ────────────────────────────────────────────────────────────

  describe('getVotersList', () => {
    it('should return [] when dishVote is null', () => {
      component.dishVote = null;
      expect(component.getVotersList('pho')).toEqual([]);
    });

    it('should return combined anonymous and user voters', () => {
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['u1'], voteAnonymous: ['a1', 'a2'], isCustom: false },
      ]);
      expect(component.getVotersList('pho')).toEqual(['a1', 'a2', 'u1']);
    });
  });

  // ── getDishBySlug ────────────────────────────────────────────────────────────

  describe('getDishBySlug', () => {
    it('should return the dish matching the slug', () => {
      component.dishes = [makeDish('pho'), makeDish('bun-bo')];
      const result = component.getDishBySlug('bun-bo');
      expect(result?.slug).toBe('bun-bo');
    });

    it('should return null when not found', () => {
      component.dishes = [];
      expect(component.getDishBySlug('unknown')).toBeNull();
    });
  });

  // ── getDishTitleBySlug ───────────────────────────────────────────────────────

  describe('getDishTitleBySlug', () => {
    beforeEach(() => {
      component.localeID = 'en';
      component.dishes = [makeDish('pho', 'Beef Pho')];
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: [], voteAnonymous: [], isCustom: false },
        { slug: 'my-custom', voteUser: [], voteAnonymous: [], isCustom: true,
          customTitle: 'My Dish' } as any,
      ]);
    });

    it('should return the dish title for a known slug', () => {
      expect(component.getDishTitleBySlug('pho')).toBe('Beef Pho');
    });

    it('should return customTitle when dish not in dishes array', () => {
      expect(component.getDishTitleBySlug('my-custom')).toBe('My Dish');
    });

    it('should fall back to slug when no customTitle and no dish', () => {
      expect(component.getDishTitleBySlug('totally-unknown')).toBe('totally-unknown');
    });
  });

  // ── getTotalVotesBySlug ──────────────────────────────────────────────────────

  describe('getTotalVotesBySlug', () => {
    it('should use voteAnonymous.length for custom items', () => {
      component.dishVote = makeDishVote([
        { slug: 'c1', voteUser: ['u1', 'u2'], voteAnonymous: ['a1'], isCustom: true } as any,
      ]);
      expect(component.getTotalVotesBySlug('c1')).toBe(1); // only voteAnonymous
    });

    it('should return 0 for unknown slug when dish not found', () => {
      component.dishes = [];
      expect(component.getTotalVotesBySlug('not-there')).toBe(0);
    });

    it('should return total votes for a known dish slug', () => {
      component.dishes = [makeDish('pho')];
      component.dishVote = makeDishVote([
        { slug: 'pho', voteUser: ['u1'], voteAnonymous: ['a1'], isCustom: false },
      ]);
      expect(component.getTotalVotesBySlug('pho')).toBe(2);
    });
  });

  // ── getCustomDish ────────────────────────────────────────────────────────────

  describe('getCustomDish', () => {
    it('should return [] when dishVote is null', () => {
      component.dishVote = null;
      expect(component.getCustomDish()).toEqual([]);
    });

    it('should return only items with isCustom=true', () => {
      component.dishVote = makeDishVote([
        { slug: 'regular', voteUser: [], voteAnonymous: [], isCustom: false },
        { slug: 'custom-1', voteUser: [], voteAnonymous: [], isCustom: true,
          customTitle: 'My Dish' } as any,
      ]);
      const result = component.getCustomDish();
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe('custom-1');
    });
  });

  // ── goBack ────────────────────────────────────────────────────────────────────

  describe('goBack', () => {
    it('should call window.history.back()', () => {
      spyOn(window.history, 'back');
      component.goBack();
      expect(window.history.back).toHaveBeenCalled();
    });
  });

  // ── resetChatWidgetPosition ───────────────────────────────────────────────────

  describe('resetChatWidgetPosition', () => {
    it('should reset chatWidgetPosition signal to {x:0, y:0}', () => {
      component.chatWidgetPosition.set({ x: 100, y: 200 });
      component.resetChatWidgetPosition();
      expect(component.chatWidgetPosition()).toEqual({ x: 0, y: 0 });
    });

    it('should save position to localStorage', () => {
      component.resetChatWidgetPosition();
      expect(localStorage.getItem('chat-widget-position')).toBe(
        JSON.stringify({ x: 0, y: 0 })
      );
    });
  });

  // ── loadChatWidgetPosition ────────────────────────────────────────────────────

  describe('loadChatWidgetPosition (via ngOnInit)', () => {
    it('should restore chatWidgetPosition from localStorage', async () => {
      localStorage.setItem(
        'chat-widget-position',
        JSON.stringify({ x: 42, y: 99 })
      );

      // Re-create component after localStorage is set
      const f2 = TestBed.createComponent(VotingComponent);
      f2.detectChanges();
      expect(f2.componentInstance.chatWidgetPosition()).toEqual({ x: 42, y: 99 });
      f2.destroy();
    });

    it('should ignore invalid JSON in localStorage', () => {
      localStorage.setItem('chat-widget-position', 'not-json');
      const f2 = TestBed.createComponent(VotingComponent);
      f2.detectChanges(); // should not throw
      expect(f2.componentInstance.chatWidgetPosition()).toEqual({ x: 0, y: 0 });
      f2.destroy();
    });
  });

  // ── initial signal state ─────────────────────────────────────────────────────

  describe('initial signal state', () => {
    it('should start with connectionState = disconnected (before socket emits)', () => {
      // connectionState$ BehaviorSubject starts at 'disconnected' but may already
      // have been updated in the suite; check the signal directly reflects the subject
      connectionState$.next('disconnected');
      expect(component.connectionState()).toBe('disconnected');
    });

    it('should start with isDragging = false', () => {
      expect(component.isDragging()).toBeFalse();
    });

    it('should start with chatWidgetPosition = {x:0, y:0}', () => {
      expect(component.chatWidgetPosition()).toEqual({ x: 0, y: 0 });
    });
  });

  // ── SEO (English) ─────────────────────────────────────────────────────────────

  describe('SEO – English locale', () => {
    it('should set English page title', () => {
      component.localeID = 'en';
      component['setupSEO']();
      expect(document.title).toBe(
        'Food Voting - Find Your Favorite Dish | What to Eat'
      );
    });
  });
});

// ── Vi locale describe ────────────────────────────────────────────────────────

describe('VotingComponent – vi locale', () => {
  let component: VotingComponent;
  let fixture: ComponentFixture<VotingComponent>;

  beforeEach(async () => {
    const socketServiceSpy = jasmine.createSpyObj('SocketService', [
      'connect', 'disconnect', 'joinRoom', 'onDishVoteUpdate', 'getConnectionState', 'emitDishVoteUpdate',
    ]);
    socketServiceSpy.onDishVoteUpdate.and.returnValue(of());
    socketServiceSpy.getConnectionState.and.returnValue(of('disconnected'));

    const dishVoteServiceSpy = jasmine.createSpyObj('DishVoteService', ['findById']);
    dishVoteServiceSpy.findById.and.returnValue(of({
      _id: 'v', title: 'T', description: '', dishVoteItems: [],
      deleted: false, createdAt: '', updatedAt: '',
    } as DishVote));

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    authServiceSpy.getProfile.and.returnValue(of(null));

    const dishServiceSpy = jasmine.createSpyObj('DishService', ['findBySlug']);

    await TestBed.configureTestingModule({
      imports: [VotingComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: SocketService, useValue: socketServiceSpy },
        { provide: DishVoteService, useValue: dishVoteServiceSpy },
        { provide: DishService, useValue: dishServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: 'v1' } } },
        },
      ],
    })
      .overrideComponent(VotingComponent, { set: { imports: STUB_IMPORTS } })
      .compileComponents();

    const registry = TestBed.inject(MatIconRegistry);
    spyOn(registry, 'getDefaultFontSetClass').and.returnValue(['material-icons']);

    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set Vietnamese page title when localeID is vi', () => {
    component.localeID = 'vi';
    component['setupSEO']();
    expect(document.title).toBe(
      'Bình Chọn Món Ăn - Tìm Món Ăn Yêu Thích | What to Eat'
    );
  });
});
