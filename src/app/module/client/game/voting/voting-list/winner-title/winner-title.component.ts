import { DishService } from '@/app/service/dish.service';
import {
  Component,
  inject,
  Input,
  LOCALE_ID,
  OnInit,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-winner-title',
  imports: [],
  templateUrl: './winner-title.component.html',
  styleUrl: './winner-title.component.scss',
})
export class WinnerTitleComponent implements OnInit {
  @Input() slug!: string;

  private dishService = inject(DishService);
  localeId = inject(LOCALE_ID);

  title = signal<string>('');

  ngOnInit(): void {
    this.dishService.findBySlug(this.slug).subscribe((dish) => {
      this.title.set(
        dish.title.find((t) => t.lang === this.localeId)?.data || '---'
      );
    });
  }
}
