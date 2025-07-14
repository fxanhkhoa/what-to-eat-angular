import { CommonModule, isPlatformServer } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  LOCALE_ID,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { DishCardFancyComponent } from '@/app/module/client/dish/dish-card-fancy/dish-card-fancy.component';
import { COLOR_PALETTE } from '@/constant/color.constant';
import { Dish } from '@/types/dish.type';
import { GameStateService } from '@/app/state/game-state.service';

type Sector = {
  color: string;
  item: Dish;
};

@Component({
  selector: 'app-wheel-player',
  imports: [CommonModule, DishCardFancyComponent],
  templateUrl: './wheel-player.component.html',
  styleUrl: './wheel-player.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WheelPlayerComponent implements AfterViewInit {
  @Input() set options(values: Dish[]) {
    this.sectors = values.map((opts, i) => {
      return {
        color:
          COLOR_PALETTE[
            (i >= COLOR_PALETTE.length ? i + 1 : i) % COLOR_PALETTE.length
          ],
        item: opts,
      };
    });

    if (this.wheel) {
      this.createWheel();
      this.engine();
    }
  }

  @Output() optionSelected = new EventEmitter<string>();

  private platformId = inject(PLATFORM_ID);
  localeId = inject(LOCALE_ID);
  private gameStateService = inject(GameStateService);

  @ViewChild('wheel') wheel!: ElementRef<HTMLCanvasElement>;
  @ViewChild('spin') spin!: ElementRef;

  sectors: Sector[] = [];
  popoverDish: Dish | null = null;
  popoverX = 0;
  popoverY = 0;

  rand = (m: number, M: number) => Math.random() * (M - m) + m;
  tot: number = 0;
  ctx: CanvasRenderingContext2D | null = null;
  dia: number = 0;
  rad: number = 0;
  PI: number = 0;
  TAU: number = 0;
  arc0: number = 0;

  friction = 0.995; // 0.995=soft, 0.99=mid, 0.98=hard
  angVel = 0; // Angular velocity
  ang = 0; // Angle in radians
  lastSelection: number = 0;

  ngOnInit() {
    // Initial rotation
    // Start engine
  }
  ngAfterViewInit(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.createWheel();
    this.engine();
  }

  createWheel() {
    this.ctx = this.wheel.nativeElement.getContext('2d');

    if (!this.ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    this.dia = this.ctx.canvas.width;
    this.tot = this.sectors.length;
    this.rad = this.dia / 2;
    this.PI = Math.PI;
    this.TAU = 2 * this.PI;

    this.arc0 = this.TAU / this.sectors.length;
    this.sectors.forEach((sector, i) => this.drawSector(sector, i));
    this.rotate(true);
  }

  spinner() {
    if (!this.angVel) this.angVel = this.rand(0.25, 0.35);
    this.engine();
  }

  getIndex = () =>
    Math.floor(this.tot - (this.ang / this.TAU) * this.tot) % this.tot;

  drawSector(sector: Sector, i: number) {
    if (!this.ctx) return;

    const ang = this.arc0 * i;
    this.ctx.save();
    // COLOR
    this.ctx.beginPath();
    this.ctx.fillStyle = sector.color;
    this.ctx.moveTo(this.rad, this.rad);

    this.ctx.arc(this.rad, this.rad, this.rad, ang, ang + this.arc0);
    this.ctx.lineTo(this.rad, this.rad);
    this.ctx.fill();
    // TEXT
    this.ctx.translate(this.rad, this.rad);
    this.ctx.rotate(ang + this.arc0 / 2);
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 15px sans-serif';
    this.ctx.fillText(
      sector.item.title
        .find((e) => e.lang === this.localeId)
        ?.data.slice(0, 15) + '...' || '',
      this.rad - 10,
      10
    );
    //
    this.ctx.restore();
  }

  rotate(first = false) {
    if (!this.ctx) return;
    const sector = this.sectors[this.getIndex()];
    this.ctx.canvas.style.transform = `rotate(${this.ang - this.PI / 2}rad)`;
    this.spin.nativeElement.textContent = !this.angVel
      ? $localize`spin`
      : sector.item.title
          .find((e) => e.lang === this.localeId)
          ?.data.slice(0, 10) + '...' || '';
    if (!first) {
      this.lastSelection = !this.angVel ? this.lastSelection : this.getIndex();
      this.selectOption();
    }
    this.spin.nativeElement.style.background = sector.color;
  }

  frame() {
    if (!this.angVel) return;

    this.angVel *= this.friction; // Decrement velocity by friction
    if (this.angVel < 0.002) this.angVel = 0; // Bring to stop
    this.ang += this.angVel; // Update angle
    this.ang %= this.TAU; // Normalize angle
    this.rotate();
  }

  engine() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    if (this.angVel) {
      this.frame();
      requestAnimationFrame(() => this.engine());
    }
    // requestAnimationFrame(this.frame.bind(this));
  }

  selectOption() {
    if (!this.angVel) {
      this.spin.nativeElement.textContent =
        this.sectors[this.lastSelection].item.title
          .find((e) => e.lang === this.localeId)
          ?.data.slice(0, 10) + '...' || '';
      this.optionSelected.emit(this.sectors[this.lastSelection].item._id);
      this.gameStateService.updateWheelOfFortuneSelectedItem({
        selectedItem: this.sectors[this.lastSelection].item,
        items: this.sectors.map((s) => s.item),
      });

      setTimeout(() => {
        this.createWheel();
      }, 1500);
    }
  }

  onSectorMouseEnter(event: MouseEvent, sector: Sector) {
    this.popoverDish = sector.item;
    this.popoverX = event.clientX;
    this.popoverY = event.clientY;

    const thresholdX = 750;

    if (window.innerWidth - this.popoverX < thresholdX) {
      this.popoverX -= thresholdX - (window.innerWidth - this.popoverX);
    }
  }

  onSectorMouseLeave() {
    this.popoverDish = null;
  }

  onCanvasMouseMove(event: MouseEvent) {
    if (!this.ctx) return;
    const rect = this.ctx.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - this.rad;
    const y = event.clientY - rect.top - this.rad;
    const distance = Math.sqrt(x * x + y * y);
    if (distance > this.rad) {
      this.onSectorMouseLeave();
      return;
    }
    let angle = Math.atan2(y, x);
    if (angle < 0) angle += this.TAU;

    // Adjust angle by current rotation
    let adjustedAngle = angle - (this.ang - this.PI / 2);
    if (adjustedAngle < 0) adjustedAngle += this.TAU;
    const sectorIndex = Math.floor(adjustedAngle / this.arc0);

    let selectedIndex = sectorIndex;
    if (selectedIndex >= this.sectors.length) {
      selectedIndex -= this.sectors.length;
    }

    const sector = this.sectors[selectedIndex];
    if (sector) {
      this.onSectorMouseEnter(event, sector);
    } else {
      this.onSectorMouseLeave();
    }
  }
}
