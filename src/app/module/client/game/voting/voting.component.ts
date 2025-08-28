import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
  LOCALE_ID,
  DOCUMENT,
  ElementRef,
} from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

// Services
import { SocketService } from '@/app/service/socket.service';
import { DishVoteService } from '@/app/service/dish-vote.service';
import { DishService } from '@/app/service/dish.service';

// Types
import { DishVote, DishVoteItem } from '@/types/dish-vote.type';
import { Dish } from '@/types/dish.type';

// Components
import { VotingNameDialogComponent } from '@/app/module/client/game/voting/voting-name-dialog/voting-name-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { DishCardFancyComponent } from '../../dish/dish-card-fancy/dish-card-fancy.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { VotingUserBadgeComponent } from './voting-user-badge/voting-user-badge.component';
import { VotingChatComponent } from './voting-chat/voting-chat.component';
import { AuthService } from '@/app/service/auth.service';
import { User } from '@/types/user.type';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    DishCardFancyComponent,
    MatCardModule,
    MatDividerModule,
    VotingUserBadgeComponent,
    VotingChatComponent,
  ],
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.scss',
})
export class VotingComponent implements OnInit, OnDestroy {
  @ViewChild('dishPreviewTemplate') dishPreviewTemplate!: TemplateRef<any>;
  @ViewChild('chatWidget', { static: false })
  chatWidget!: ElementRef<HTMLDivElement>;

  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private socketService = inject(SocketService);
  private dishVoteService = inject(DishVoteService);
  private dishService = inject(DishService);
  private authService = inject(AuthService);
  localeID = inject(LOCALE_ID);

  dishVoteID: string = '';
  dishVote: DishVote | null = null;
  dishes: Dish[] = [];
  userAvatar: string | undefined = undefined; // Add user avatar property
  loading: boolean = true;
  error: string | null = null;
  selectedDishForPreview: any = null;
  connectionState = signal<string>('disconnected');
  profile = signal<User | null>(null);

  // Chat widget drag position
  chatWidgetPosition = signal({ x: 0, y: 0 });
  isDragging = signal(false);

  ngOnInit(): void {
    this.dishVoteID = this.route.snapshot.params['id'];
    this.setupSEO();
    this.loadData();
    this.setupSocketConnection();
    this.loadChatWidgetPosition(); // Load saved chat widget position
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.removeCanonicalLink();
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.disconnect();
  }

  loadProfile() {
    this.authService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
        },
        error: (error) => {
          console.error('Error loading profile:', error);
        },
      });
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.dishVoteService
      .findById(this.dishVoteID)
      .pipe(
        switchMap((dishVote) => {
          this.dishVote = dishVote;

          // Get all dish slugs from dish vote items
          const dishSlugs = dishVote.dishVoteItems
            .filter((item) => !item.customTitle)
            .map((item) => item.slug);

          // Fetch all dishes
          if (dishSlugs.length > 0) {
            return forkJoin(
              dishSlugs.map((slug) =>
                this.dishService
                  .findBySlug(slug)
                  .pipe(catchError(() => of(null)))
              )
            ).pipe(
              map((dishes) => dishes.filter((dish) => dish !== null) as Dish[])
            );
          }
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (dishes) => {
          this.dishes = dishes;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.error = 'Failed to load voting data';
          this.loading = false;
        },
      });
  }

  private setupSocketConnection(): void {
    this.socketService.connect();
    this.socketService.joinRoom(this.dishVoteID);

    this.socketService
      .onDishVoteUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.dishVote = data;
      });

    this.socketService
      .getConnectionState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.connectionState.set(state);
      });
  }

  onVote(dish: Dish): void {
    if (!this.profile() || !this.dishVote) return;

    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === dish.slug
    );
    const isCurrentlyVoted =
      dishVoteItem?.voteAnonymous.includes(this.profile()!._id) ||
      dishVoteItem?.voteUser.includes(this.profile()!._id) ||
      false;

    this.socketService.emitDishVoteUpdate(
      {
        slug: dish.slug,
        myName: this.profile()!._id,
        userID: null,
        isVoting: !isCurrentlyVoted,
      },
      { roomID: this.dishVoteID }
    );
  }

  onCustomVote(slug: string): void {
    if (!this.profile() || !this.dishVote) return;

    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === slug
    );
    const isCurrentlyVoted =
      dishVoteItem?.voteAnonymous.includes(this.profile()!._id) ||
      dishVoteItem?.voteUser.includes(this.profile()!._id) ||
      false;

    this.socketService.emitDishVoteUpdate(
      {
        slug: slug,
        myName: this.profile()!._id,
        userID: null,
        isVoting: !isCurrentlyVoted,
      },
      { roomID: this.dishVoteID }
    );
  }

  getAllMax(): string[] {
    if (!this.dishVote) return [];

    let max = 0;
    let maxItems: string[] = [];

    this.dishVote.dishVoteItems.forEach((item) => {
      const totalVotes = item.voteAnonymous.length + item.voteUser.length;
      if (totalVotes === 0) return;
      if (max < totalVotes) {
        max = totalVotes;
        maxItems = [item.slug];
      } else if (max === totalVotes) {
        maxItems = [...maxItems, item.slug];
      }
    });

    return maxItems;
  }

  getWinnerNames(): string {
    const maxSlugs = this.getAllMax();
    return maxSlugs
      .map((slug) => {
        const dish = this.dishes.find((d) => d.slug === slug);
        if (!dish) {
          return (
            this.dishVote?.dishVoteItems.find((item) => item.slug === slug)
              ?.customTitle || slug
          );
        }
        return dish?.title.find((t) => t?.lang === this.localeID)?.data;
      })
      .join(', ');
  }

  isWinnerDish(slug: string): boolean {
    const maxSlugs = this.getAllMax();
    return maxSlugs.includes(slug);
  }

  getDishTitle(dish: Dish): string {
    if (dish.deleted) return dish.slug;
    return dish.title.find((t) => t?.lang === this.localeID)?.data || dish.slug;
  }

  getDishDescription(dish: Dish): string {
    if (dish.deleted) return '';
    const description =
      dish.shortDescription.find((d) => d?.lang === this.localeID)?.data || '';
    return description.length > 90
      ? description.slice(0, 90) + '...'
      : description;
  }

  isVotedByMe(slug: string): boolean {
    if (!this.dishVote || !this.profile()) return false;
    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === slug
    );
    return (
      dishVoteItem?.voteAnonymous.includes(this.profile()!._id) ||
      dishVoteItem?.voteUser.includes(this.profile()!._id) ||
      false
    );
  }

  getVoteUsers(dish: Dish): string[] {
    if (!this.dishVote) return [];
    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === dish.slug
    );
    return dishVoteItem?.voteAnonymous || [];
  }

  getTotalVotes(slug: string): number {
    if (!this.dishVote) return 0;
    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === slug
    );
    return (
      (dishVoteItem?.voteAnonymous.length || 0) +
      (dishVoteItem?.voteUser.length || 0)
    );
  }

  getVotersList(slug: string): string[] {
    if (!this.dishVote) return [];
    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === slug
    );
    return [
      ...(dishVoteItem?.voteAnonymous || []),
      ...(dishVoteItem?.voteUser || []),
    ];
  }

  getDishBySlug(slug: string): Dish | null {
    return this.dishes.find((d) => d.slug === slug) || null;
  }

  getDishTitleBySlug(slug: string): string {
    const dish = this.getDishBySlug(slug);
    if (!dish) {
      return (
        this.dishVote?.dishVoteItems.find((item) => item.slug === slug)
          ?.customTitle || slug
      );
    }
    return this.getDishTitle(dish);
  }

  getVotesListBySlug(slug: string): string[] {
    const dish = this.getDishBySlug(slug);
    if (!dish) return [];
    return this.getVotersList(dish.slug);
  }

  getTotalVotesBySlug(slug: string): number {
    const dish = this.getDishBySlug(slug);
    if (!dish) return 0;
    return this.getTotalVotes(dish.slug);
  }

  getCustomDish(): DishVoteItem[] {
    return this.dishVote?.dishVoteItems.filter((item) => item.isCustom) ?? [];
  }

  goBack() {
    window.history.back();
  }

  private setupSEO(): void {
    const isVietnamese = this.localeID === 'vi';

    if (isVietnamese) {
      this.titleService.setTitle(
        'Bình Chọn Món Ăn - Tìm Món Ăn Yêu Thích | What to Eat'
      );

      this.metaService.updateTag({
        name: 'description',
        content:
          'Tham gia bình chọn món ăn cùng bạn bè và gia đình. Chọn món ăn yêu thích từ danh sách và xem kết quả bình chọn theo thời gian thực.',
      });

      this.metaService.updateTag({
        name: 'keywords',
        content:
          'bình chọn món ăn, vote món ăn, chọn món ăn, game ẩm thực, bình chọn trực tuyến, tương tác nhóm, món ăn yêu thích',
      });

      // Open Graph tags
      this.metaService.updateTag({
        property: 'og:title',
        content: 'Bình Chọn Món Ăn - Tìm Món Ăn Yêu Thích',
      });

      this.metaService.updateTag({
        property: 'og:description',
        content:
          'Tham gia bình chọn món ăn cùng bạn bè và gia đình. Chọn món ăn yêu thích và xem kết quả theo thời gian thực.',
      });

      // Twitter Card tags
      this.metaService.updateTag({
        name: 'twitter:title',
        content: 'Bình Chọn Món Ăn - Tìm Món Ăn Yêu Thích',
      });

      this.metaService.updateTag({
        name: 'twitter:description',
        content:
          'Tham gia bình chọn món ăn cùng bạn bè. Chọn món yêu thích và xem kết quả bình chọn trực tuyến.',
      });
    } else {
      this.titleService.setTitle(
        'Food Voting - Find Your Favorite Dish | What to Eat'
      );

      this.metaService.updateTag({
        name: 'description',
        content:
          'Join food voting with friends and family. Choose your favorite dishes from the list and see real-time voting results together.',
      });

      this.metaService.updateTag({
        name: 'keywords',
        content:
          'food voting, dish voting, food poll, culinary game, online voting, group interaction, favorite dishes, food selection',
      });

      // Open Graph tags
      this.metaService.updateTag({
        property: 'og:title',
        content: 'Food Voting - Find Your Favorite Dish',
      });

      this.metaService.updateTag({
        property: 'og:description',
        content:
          'Join food voting with friends and family. Choose your favorite dishes and see real-time voting results together.',
      });

      // Twitter Card tags
      this.metaService.updateTag({
        name: 'twitter:title',
        content: 'Food Voting - Find Your Favorite Dish',
      });

      this.metaService.updateTag({
        name: 'twitter:description',
        content:
          'Join food voting with friends. Choose favorite dishes and see real-time voting results.',
      });
    }

    // Common meta tags
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({
      property: 'og:site_name',
      content: 'What to Eat',
    });
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });

    this.addOrUpdateCanonicalLink();
  }

  private addOrUpdateCanonicalLink(): void {
    const head = this.document.querySelector('head');
    if (!head) return;

    // Remove existing canonical link
    this.removeCanonicalLink();

    // Create new canonical link
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute(
      'href',
      `${this.document.location.origin}/game/voting/${this.dishVoteID}`
    );
    head.appendChild(link);
  }

  private removeCanonicalLink(): void {
    const head = this.document.querySelector('head');
    const existingCanonical = head?.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      head?.removeChild(existingCanonical);
    }
  }

  /**
   * Save chat widget position to localStorage
   */
  private saveChatWidgetPosition(position: { x: number; y: number }): void {
    localStorage.setItem('chat-widget-position', JSON.stringify(position));
  }

  /**
   * Load chat widget position from localStorage
   */
  private loadChatWidgetPosition(): void {
    const saved = localStorage.getItem('chat-widget-position');
    if (saved) {
      try {
        const position = JSON.parse(saved);
        this.chatWidgetPosition.set(position);
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  }

  /**
   * Reset chat widget position to default
   */
  resetChatWidgetPosition(): void {
    this.chatWidgetPosition.set({ x: 0, y: 0 });
    this.saveChatWidgetPosition({ x: 0, y: 0 });
  }
}
