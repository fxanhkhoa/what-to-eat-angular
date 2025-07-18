import {
  Component,
  inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreateDishVoteDto } from '@/types/dish-vote.type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { DishService } from '@/app/service/dish.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DishCardFancyComponent } from '@/app/module/client/dish/dish-card-fancy/dish-card-fancy.component';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { finalize } from 'rxjs';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { DishFilterComponent } from '../../../dish/dish-filter/dish-filter.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-voting-create-update',
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    CommonModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatTabsModule,
    DragDropModule,
    DishCardFancyComponent,
    MultiLanguagePipe,
    MatProgressSpinnerModule,
    MatExpansionModule,
    DishFilterComponent,
    MatPaginatorModule,
  ],
  templateUrl: './voting-create-update.component.html',
  styleUrl: './voting-create-update.component.scss',
})
export class VotingCreateUpdateComponent implements OnDestroy, OnInit {
  @ViewChild('dishPreviewTemplate') dishPreviewTemplate!: TemplateRef<any>;

  private fb = inject(FormBuilder);
  private dishService = inject(DishService);
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  localeID = inject(LOCALE_ID);

  openSidenav = signal(true);
  selectedDishForPreview: any = null;
  private overlayRef: OverlayRef | null = null;
  dishVoteForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    dishVoteItems: this.fb.array([]),
  });

  availableDishes = signal<Dish[]>([]);

  selectedDishes = signal<Dish[]>([]);
  currentPage = signal(1);
  limit = signal(10);
  total = signal(0);
  loading = signal(false);
  dto: QueryDishDto = {};

  ngOnInit(): void {
    this.getDishes();
  }

  goBack() {
    window.history.back();
  }

  getDishes() {
    this.loading.set(true);
    this.dishService
      .findAll({ ...this.dto, limit: this.limit(), page: this.currentPage() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((res) => {
        this.availableDishes.set(res.data);
        this.total.set(res.count);
      });
  }

  onSearch(dto: QueryDishDto) {
    this.dto = dto;
    this.getDishes();
  }

  paginatorChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.getDishes();
  }

  get dishVoteItems(): FormArray {
    return this.dishVoteForm.get('dishVoteItems') as FormArray;
  }

  createDishVoteItem(): FormGroup {
    return this.fb.group({
      slug: ['', Validators.required],
      voteUser: this.fb.array([]),
      voteAnonymous: this.fb.array([]),
      isCustom: [false],
    });
  }

  addDishVoteItem() {
    this.dishVoteItems.push(this.createDishVoteItem());
  }

  removeDishVoteItem(index: number) {
    this.dishVoteItems.removeAt(index);
  }

  onSubmit() {
    if (this.dishVoteForm.valid) {
      const formValue: CreateDishVoteDto = this.dishVoteForm.value;
      console.log('Form submitted:', formValue);
      // Handle form submission
    }
  }

  drop(event: CdkDragDrop<Dish[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const dish = event.previousContainer.data[event.previousIndex];

      // If moving from available to selected
      if (event.container.element.nativeElement.id === 'selected-dishes') {
        // Add to FormArray
        const dishVoteItem = this.createDishVoteItem();
        dishVoteItem.patchValue({
          slug: dish.slug,
          isCustom: false,
        });
        this.dishVoteItems.push(dishVoteItem);

        // Update selected dishes signal
        this.selectedDishes.update((dishes) => [...dishes, dish]);

        // Remove from available dishes
        this.availableDishes.update((dishes) =>
          dishes.filter((d) => d._id !== dish._id)
        );
      }
      // If moving from selected back to available
      else if (
        event.container.element.nativeElement.id === 'available-dishes'
      ) {
        // Remove from FormArray
        const dishIndex = this.selectedDishes().findIndex(
          (d) => d._id === dish._id
        );
        if (dishIndex !== -1) {
          this.dishVoteItems.removeAt(dishIndex);
        }

        // Update signals
        this.selectedDishes.update((dishes) =>
          dishes.filter((d) => d._id !== dish._id)
        );
        this.availableDishes.update((dishes) => [...dishes, dish]);
      }
    }
  }

  showDishPreview(event: MouseEvent, dish: any) {
    this.selectedDishForPreview = dish;

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }

    const target = event.target as HTMLElement;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(target)
      .withPositions([
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: 8,
        },
        {
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -8,
        },
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -8,
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: false,
    });

    const templatePortal = new TemplatePortal(
      this.dishPreviewTemplate,
      this.viewContainerRef
    );

    this.overlayRef.attach(templatePortal);
  }

  hideDishPreview() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  ngOnDestroy() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}
