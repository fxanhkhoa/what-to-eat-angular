import { CommonModule, isPlatformServer } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
  LOCALE_ID,
  PLATFORM_ID,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { DishVoteService } from '@/app/service/dish-vote.service';
import { DishVote, DishVoteFilter, DishVoteItem } from '@/types/dish-vote.type';
import { EmptyComponent } from '@/app/components/empty/empty.component';
import { SearchBarComponent } from '@/app/shared/component/search-bar/search-bar.component';
import { WinnerTitleComponent } from './winner-title/winner-title.component';

@Component({
  selector: 'app-voting-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatPaginatorModule,
    RouterModule,
    EmptyComponent,
    SearchBarComponent,
    WinnerTitleComponent,
    MatDialogModule,
  ],
  templateUrl: './voting-list.component.html',
  styleUrl: './voting-list.component.scss',
})
export class VotingListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private dishVoteService = inject(DishVoteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  localeId = inject(LOCALE_ID);
  private platformId = inject(PLATFORM_ID);

  // Signals for reactive state management
  votingSessions = signal<DishVote[]>([]);
  loading = signal<boolean>(false);
  total = signal(0);
  limit = signal(10);
  currentPage = signal(1);
  keyword = signal<string>('');

  // Filter DTO
  dto: DishVoteFilter = {};

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.keyword.set(params['keyword'] || '');
      this.currentPage.set(+params['page'] || 1);
      this.loadVotingSessions();
    });
  }

  loadVotingSessions() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.loading.set(true);
    this.dto = {
      keyword: this.keyword() || '',
      page: this.currentPage(),
      limit: this.limit(),
    };

    this.dishVoteService
      .findAll(this.dto)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.votingSessions.set(response.data);
          this.total.set(response.count);
        },
        error: (error) => {
          console.error('Error loading voting sessions:', error);
        },
      });
  }

  onSearch(keyword: string) {
    this.keyword.set(keyword);
    this.currentPage.set(1);
    this.loadVotingSessions();
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.loadVotingSessions();
  }

  navigateToVotingSession(sessionId: string) {
    this.router.navigate(['/game/voting', sessionId]);
  }

  createNewVotingSession() {
    this.router.navigate(['/game/voting/create']);
  }

  getTotalVotes(session: DishVote): number {
    return session.dishVoteItems.reduce((total, item) => {
      return (
        total + (item.voteUser?.length || 0) + (item.voteAnonymous?.length || 0)
      );
    }, 0);
  }

  getMostVotedDish(
    session: DishVote
  ): (DishVoteItem & { votes: number }) | null {
    let maxVotes = 0;
    let mostVoted = null;

    for (const item of session.dishVoteItems) {
      const votes =
        (item.voteUser?.length || 0) + (item.voteAnonymous?.length || 0);
      if (votes > maxVotes) {
        maxVotes = votes;
        mostVoted = {
          ...item,
          votes: votes,
        };
      }
    }

    return mostVoted;
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString(this.localeId, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  hasCustomDishes(session: DishVote): boolean {
    return session.dishVoteItems.some((item) => item.isCustom);
  }

  async openShareDialog(session: DishVote) {
    const url = window.location.origin + '/game/voting/' + session._id;
    const { ShareDialogComponent } = await import(
      './share-dialog/share-dialog.component'
    );
    this.dialog.open(ShareDialogComponent, {
      data: { url },
      autoFocus: false,
      width: '60vw',
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
