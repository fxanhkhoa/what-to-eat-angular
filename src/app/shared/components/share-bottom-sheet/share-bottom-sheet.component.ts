import { CommonModule } from '@angular/common';
import { Component, inject, Inject, LOCALE_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Dish } from '@/types/dish.type';
import { UserDishInteractionService } from '@/app/service/user-dish-interaction.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';

export interface ShareBottomSheetData {
  dish: Dish;
}

@Component({
  selector: 'app-share-bottom-sheet',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MultiLanguagePipe,
  ],
  templateUrl: './share-bottom-sheet.component.html',
  styleUrl: './share-bottom-sheet.component.scss',
})
export class ShareBottomSheetComponent {
  private bottomSheetRef = inject(MatBottomSheetRef<ShareBottomSheetComponent>);
  private userDishInteractionService = inject(UserDishInteractionService);
  private toastr = inject(ToastService);
  localeId = inject(LOCALE_ID);

  data = inject<ShareBottomSheetData>(MAT_BOTTOM_SHEET_DATA);

  canUseNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }

  private getShareUrl(): string {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      return `${baseUrl}/dish/${this.data.dish.slug}`;
    }
    return '';
  }

  private recordShare(): void {
    this.userDishInteractionService
      .recordShare({
        userId: '', // Will be set by backend
        dishId: this.data.dish._id,
        dishSlug: this.data.dish.slug,
      })
      .subscribe({
        next: () => {
          console.log('Share recorded');
        },
        error: (err) => {
          console.error('Failed to record share', err);
        },
      });
  }

  copyLink(): void {
    const url = this.getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.toastr.showSuccess('Success', 'Link copied to clipboard!');
        this.recordShare();
        this.dismiss();
      });
    }
  }

  shareToFacebook(): void {
    const url = this.getShareUrl();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    this.recordShare();
    this.dismiss();
  }

  shareToTwitter(): void {
    const url = this.getShareUrl();
    const text = `Check out this recipe: ${this.data.dish.title[0]?.data}`;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    this.recordShare();
    this.dismiss();
  }

  shareToWhatsApp(): void {
    const url = this.getShareUrl();
    const text = `Check out this recipe: ${this.data.dish.title[0]?.data} - ${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    this.recordShare();
    this.dismiss();
  }

  shareViaEmail(): void {
    const url = this.getShareUrl();
    const subject = `Recipe: ${this.data.dish.title[0]?.data}`;
    const body = `I found this amazing recipe and thought you might like it!\n\n${this.data.dish.title[0]?.data}\n\n${url}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    this.recordShare();
    this.dismiss();
  }

  shareNative(): void {
    if (this.canUseNativeShare) {
      const url = this.getShareUrl();
      navigator
        .share({
          title: this.data.dish.title[0]?.data,
          text: `Check out this recipe: ${this.data.dish.title[0]?.data}`,
          url: url,
        })
        .then(() => {
          this.recordShare();
          this.dismiss();
        })
        .catch((error) => {
          console.error('Error sharing:', error);
        });
    }
  }
}
