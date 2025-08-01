import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, LOCALE_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game-section',
  imports: [CommonModule, MatIconModule, MatButtonModule, MultiLanguagePipe],
  templateUrl: './game-section.component.html',
  styleUrl: './game-section.component.scss',
})
export class GameSectionComponent {
  localeId = inject(LOCALE_ID);

  slides = [
    {
      id: 1,
      image: '/assets/images/wheel-of-fortune.png',
      title: [
        { lang: 'en', data: 'Food Wheel Of Fortune' },
        { lang: 'vi', data: 'Chiếc Nón Kì Diệu' },
      ],
      description: [
        {
          lang: 'en',
          data: 'This exciting and interactive game is designed to banish indecision and inject some fun into your dining choices. Simply spin the wheel, and let fate (and a dash of delicious randomness) pick your next meal.',
        },
        {
          lang: 'vi',
          data: 'Đây nè, cái game hay ho này sẽ giúp bạn dẹp tan sự lăn tăn mỗi khi chọn món, mà còn vui banh nóc nữa chứ! Đơn giản lắm, chỉ cần quay bánh xe thôi, rồi để may rủi cùng chút ngẫu hứng "chỉ điểm" bữa tiếp theo cho bạn. Quá đã phải không!',
        },
      ],
    },
    {
      id: 2,
      image: '/assets/images/flipping-card-game.png',
      title: [
        { lang: 'vi', data: `Foodie Flip: Tối nay ăn gì?` },
        { lang: 'en', data: `Foodie Flip:  What's for Dinner?` },
      ],
      description: [
        {
          lang: 'vi',
          data: `Sẵn sàng để "chiến" nào... hay đúng hơn là để "ngẫu nhiên"! Foodie Flip: Tối nay ăn gì? là trò chơi lật thẻ đơn giản nhưng cực kỳ hấp dẫn, nơi trí nhớ và một chút may mắn sẽ quyết định bữa ăn tiếp theo của bạn. Người chơi sẽ lật các thẻ úp, mỗi thẻ ẩn chứa một món ăn ngon miệng. Mục tiêu của bạn? Ghi nhớ vị trí của từng món ăn hấp dẫn. Nhưng đây mới là điều thú vị: lá bài cuối cùng bạn lật thành công chính là món ăn sẽ được "chọn để thưởng thức"! Dù đó là một chiếc pizza phô mai béo ngậy, một miếng bít tết mềm và mọng hay một món tráng miệng ngọt ngào, áp lực sẽ dồn lên bạn để tìm ra lượt lật cuối cùng hoàn hảo. Hoàn hảo cho mọi lứa tuổi, Foodie Flip là một trò chơi nhanh chóng, lôi cuốn, hứa hẹn mang lại tiếng cười, một chút chiến lược và rất nhiều niềm vui khiến bạn thèm ăn!`,
        },
        {
          lang: 'en',
          data: `Get ready to rumble... or rather, to munch! Foodie Flip: What's for Dinner? is the deliciously simple card-flipping game where your memory and a bit of luck decide your next meal. Players will reveal a spread of face-down cards, each hiding a mouth-watering food item. Your goal? To remember where each delectable dish is. But here's the twist: the very last card you successfully flip is the dish that's "chosen to be eaten"! Whether it's a cheesy pizza, a sizzling steak, or a decadent dessert, the pressure is on to find the perfect last flip. Perfect for all ages, Foodie Flip is a quick, engaging game that promises laughs, a little bit of strategy, and a whole lot of hunger-inducing fun!`,
        },
      ],
    },
    {
      id: 3,
      image: '/assets/images/voting-game.png',
      title: [
        { lang: 'en', data: 'Voting Game' },
        { lang: 'vi', data: 'Trò chơi bình chọn' },
      ],
      description: [
        {
          lang: 'en',
          data: `Welcome to Food Fight: The Ultimate Feast! – the deliciously democratic voting game where every player gets a say in what's for dinner! Forget boring menus and endless debates; in this game, a smorgasbord of delectable dishes is laid out before you. Each round, players cast their votes for their favorite food item, from exotic culinary creations to comforting classics. The dish that garners the most votes wins, and that's what we'll be "eating" (or at least celebrating!) this round! Strategize, persuade, and maybe even bluff your way to your favorite meal. Will it be a spicy taco night, a cheesy pizza party, or a decadent dessert extravaganza? Only the votes will tell! Food Fight: The Ultimate Feast! is a fun, lighthearted game perfect for friends and family who love food and a good-natured competition.`,
        },
        {
          lang: 'vi',
          data: `Chào mừng đến với Food Fight: Đại Tiệc Vô Song! – trò chơi bỏ phiếu ẩm thực siêu dân chủ, nơi mỗi người chơi đều được nói lên món mình muốn ăn tối nay! Quên đi những thực đơn nhàm chán và những cuộc tranh cãi bất tận nhé. Trong trò này, một "bàn tiệc" đầy ắp món ngon sẽ được bày ra trước mắt bạn. Mỗi vòng, người chơi sẽ bỏ phiếu cho món ăn yêu thích của mình, từ những sáng tạo độc đáo cho đến những món kinh điển quen thuộc. Món nào nhận được nhiều phiếu nhất sẽ thắng cuộc, và đó chính là món mà chúng ta sẽ "ăn" (hay ít nhất là cùng nhau ăn mừng!) trong vòng đó! Hãy lên chiến lược, thuyết phục và thậm chí là giả vờ để món bạn thích giành chiến thắng nhé. Liệu tối nay sẽ là đêm taco cay nồng, một bữa tiệc pizza ngập tràn phô mai, hay một bữa tiệc tráng miệng sang chảnh? Chỉ có phiếu bầu mới biết thôi! Food Fight: Đại Tiệc Vô Song! là một trò chơi vui vẻ, nhẹ nhàng, cực kỳ hợp cho bạn bè và gia đình nào yêu ẩm thực và thích những cuộc cạnh tranh vui vẻ nhé!`,
        },
      ],
    },
  ];

  currentSlide = 1;

  // Previous slide
  onPreviousClick() {
    const previous = this.currentSlide - 1;
    this.currentSlide = previous < 0 ? this.slides.length - 1 : previous;
  }

  // Next slide
  onNextClick() {
    const next = this.currentSlide + 1;
    this.currentSlide = next === this.slides.length ? 0 : next;
  }

  // Go to a specific slide
  goToSlide(index: number) {
    this.currentSlide = index;
  }
}
