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
} from '@angular/core';
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
  ],
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.scss',
})
export class VotingComponent implements OnInit, OnDestroy {
  @ViewChild('dishPreviewTemplate') dishPreviewTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private socketService = inject(SocketService);
  private dishVoteService = inject(DishVoteService);
  private dishService = inject(DishService);
  localeID = inject(LOCALE_ID);

  dishVoteID: string = '';
  dishVote: DishVote | null = null;
  dishes: Dish[] = [];
  myName = signal<string>('');
  loading: boolean = true;
  error: string | null = null;
  selectedDishForPreview: any = null;

  ngOnInit(): void {
    this.dishVoteID = this.route.snapshot.params['id'];
    this.loadData();
    this.setupSocketConnection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.disconnect();
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
          this.openNameDialog();
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
  }

  private openNameDialog(): void {
    if (!this.myName()) {
      const dialogRef = this.dialog.open(VotingNameDialogComponent, {
        disableClose: true,
        width: '400px',
      });

      dialogRef.afterClosed().subscribe((name) => {
        if (name) {
          this.myName.set(name);
        }
      });
    }
  }

  onVote(dish: Dish): void {
    if (!this.myName || !this.dishVote) return;

    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === dish.slug
    );
    const isCurrentlyVoted =
      dishVoteItem?.voteAnonymous.includes(this.myName()) || false;

    this.socketService.emitDishVoteUpdate(
      {
        slug: dish.slug,
        myName: this.myName(),
        userID: null,
        isVoting: !isCurrentlyVoted,
      },
      { roomID: this.dishVoteID }
    );
  }

  onCustomVote(slug: string): void {
    if (!this.myName() || !this.dishVote) return;

    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === slug
    );
    const isCurrentlyVoted =
      dishVoteItem?.voteAnonymous.includes(this.myName()) || false;

    this.socketService.emitDishVoteUpdate(
      {
        slug: slug,
        myName: this.myName(),
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
    if (!this.dishVote || !this.myName) return false;
    const dishVoteItem = this.dishVote.dishVoteItems.find(
      (e) => e.slug === slug
    );
    return dishVoteItem?.voteAnonymous.includes(this.myName()) || false;
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
}
