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
import { Router, RouterModule } from '@angular/router';
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
import { CreateDishVoteDto, DishVoteItem } from '@/types/dish-vote.type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DishService } from '@/app/service/dish.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DishCardFancyComponent } from '@/app/module/client/dish/dish-card-fancy/dish-card-fancy.component';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { finalize, timeout } from 'rxjs';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { DishFilterComponent } from '../../../dish/dish-filter/dish-filter.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCustomDishComponent } from './add-custom-dish/add-custom-dish.component';
import { MatDividerModule } from '@angular/material/divider';
import { DishVoteService } from '@/app/service/dish-vote.service';
import { VOTING_SESSION_TIMEOUT } from '@/constant/general.constant';

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
    MatTooltipModule,
    MatDialogModule,
    MatDividerModule,
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
  private dialog = inject(MatDialog);
  private dishVoteService = inject(DishVoteService);
  private router = inject(Router);

  openSidenav = signal(true);
  selectedDishForPreview: any = null;
  private overlayRef: OverlayRef | null = null;
  dishVoteForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    dishVoteItems: this.fb.array(
      [],
      [Validators.required, Validators.minLength(1)]
    ),
  });

  availableDishes = signal<Dish[]>([]);

  selectedDishes = signal<Dish[]>([]);
  customDishes = signal<DishVoteItem[]>([]);
  currentPage = signal(1);
  limit = signal(10);
  total = signal(0);
  loading = signal(false);
  dto: QueryDishDto = {};
  creatingLoading = signal(false);

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
      customTitle: [''],
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

  clearSelectedDishes() {
    this.selectedDishes.set([]);
    this.dishVoteItems.clear();
  }

  removeDish(dish: Dish) {
    const index = this.selectedDishes().findIndex((d) => d._id === dish._id);
    if (index !== -1) {
      this.selectedDishes.update((dishes) => {
        const newDishes = [...dishes];
        newDishes.splice(index, 1);
        return newDishes;
      });
      this.dishVoteItems.removeAt(index);
    }
  }

  removeCustomDish(customDish: DishVoteItem) {
    const index = this.customDishes().findIndex(
      (d) =>
        d.slug === customDish.slug && d.customTitle === customDish.customTitle
    );
    if (index !== -1) {
      this.customDishes.update((dishes) => {
        const newDishes = [...dishes];
        newDishes.splice(index, 1);
        return newDishes;
      });
      this.dishVoteItems.removeAt(
        this.dishVoteItems.controls.findIndex(
          (item) => item.value.slug === customDish.slug
        )
      );
    }
  }

  addCustomDish() {
    this.dialog
      .open(AddCustomDishComponent, {
        width: '40vw',
        data: {
          title: 'Add Custom Dish',
          description: 'Create a custom dish for voting',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          const dishVoteItem = this.createDishVoteItem();
          dishVoteItem.patchValue({
            slug: result.slug,
            customTitle: result.customTitle,
            isCustom: true,
            voteUser: [],
            voteAnonymous: [],
          });
          this.dishVoteItems.push(dishVoteItem);
          this.customDishes.update((dishes) => [
            ...dishes,
            {
              slug: result.slug,
              customTitle: result.customTitle,
              isCustom: true,
              voteUser: [],
              voteAnonymous: [],
            },
          ]);
        }
      });
  }

  onSubmit() {
    if (this.dishVoteForm.valid) {
      const formValue: CreateDishVoteDto = this.dishVoteForm.value;
      this.creatingLoading.set(true);
      this.dishVoteService
        .create(formValue)
        .pipe(
          finalize(() => this.creatingLoading.set(false)),
          timeout(VOTING_SESSION_TIMEOUT)
        )
        .subscribe((res) => {
          this.router.navigate(['/game/voting', res._id]);
        });
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
