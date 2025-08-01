import { MultiLanguage } from '@/types/base.type';
import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

type FoodQuote = {
  text: MultiLanguage<string>[];
  author: string;
};

@Component({
  selector: 'app-quote-section',
  imports: [MultiLanguagePipe, MatButtonModule, MatIconModule],
  templateUrl: './quote-section.component.html',
  styleUrl: './quote-section.component.scss',
})
export class QuoteSectionComponent implements OnInit {
  localeId = inject<string>(LOCALE_ID);

  quotes: FoodQuote[] = [
    {
      text: [
        {
          lang: 'en',
          data: 'One cannot think well, love well, sleep well, if one has not dined well.',
        },
        {
          lang: 'vi',
          data: 'Không thể suy nghĩ tốt, yêu tốt, ngủ tốt, nếu không ăn uống tốt.',
        },
      ],
      author: 'Virginia Woolf',
    },
    {
      text: [
        {
          lang: 'en',
          data: 'People who love to eat are always the best people.',
        },
        {
          lang: 'vi',
          data: 'Những người yêu thích ăn uống luôn là những người tuyệt vời nhất.',
        },
      ],
      author: 'Julia Child',
    },
    {
      text: [
        {
          lang: 'en',
          data: "The only time to eat diet food is while you're waiting for the steak to cook.",
        },
        {
          lang: 'vi',
          data: 'Thời điểm duy nhất để ăn đồ ăn kiêng là khi bạn đang chờ miếng bít tết chín.',
        },
      ],
      author: 'Julia Child',
    },
    {
      text: [
        {
          lang: 'en',
          data: 'Food is our common ground, a universal experience.',
        },
        {
          lang: 'vi',
          data: 'Ẩm thực là điểm chung của chúng ta, một trải nghiệm toàn cầu.',
        },
      ],
      author: 'James Beard',
    },
    {
      text: [
        {
          lang: 'en',
          data: 'Life is uncertain. Eat dessert first.',
        },
        {
          lang: 'vi',
          data: 'Cuộc sống thật vô thường. Hãy ăn tráng miệng trước.',
        },
      ],
      author: 'Ernestine Ulmer',
    },
  ];

  currentQuote: FoodQuote = this.quotes[0];
  visible = true;

  ngOnInit(): void {
    this.getRandomQuote();
  }

  getRandomQuote(): void {
    this.visible = false;
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * this.quotes.length);
      this.currentQuote = this.quotes[randomIndex];
      this.visible = true;
    }, 300);
  }
}
