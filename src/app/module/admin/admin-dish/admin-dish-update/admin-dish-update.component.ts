import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  LOCALE_ID,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AvailableLanguages } from '@/constant/language.constant';
import { DIFFICULT_LEVELS, MEAL_CATEGORIES } from '@/enum/dish.enum';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  mergeMap,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  CreateDishDto,
  Dish,
  IngredientsInDish,
  UpdateDishDto,
} from '@/types/dish.type';
import { DishService } from '@/app/service/dish.service';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { QuillModule, QuillModules } from 'ngx-quill';
import { MatDialog } from '@angular/material/dialog';
import { ImageViewerComponent } from '@/app/shared/widget/image-viewer/image-viewer.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoViewerComponent } from '@/app/shared/widget/video-viewer/video-viewer.component';
import { Ingredient } from '@/types/ingredient.type';
import { IngredientService } from '@/app/service/ingredient.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@/app/shared/service/toast.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';

@Component({
  selector: 'app-admin-dish-update',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    MatAutocompleteModule,
    MultiLanguagePipe,
    QuillModule,
    MatProgressSpinnerModule,
    CategoryTranslatePipe,
  ],
  templateUrl: './admin-dish-update.component.html',
  styleUrl: './admin-dish-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDishUpdateComponent {
  private dishService = inject(DishService);
  private dialog = inject(MatDialog);
  private sanitizer = inject(DomSanitizer);
  private ingredientService = inject(IngredientService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private router = inject(Router);
  localeId = inject(LOCALE_ID);

  dishForm: FormGroup = new FormGroup([]);
  availableLanguages = AvailableLanguages;
  difficultyLevels = Object.values(DIFFICULT_LEVELS);
  mealCategoryOptions = Object.values(MEAL_CATEGORIES);
  ingredientCategoryOptions = Object.values(INGREDIENT_CATEGORIES);
  filteredIngredients!: Observable<Ingredient[]>;

  relatedDishCtrl = new FormControl('');
  filteredDishes: Observable<Dish[]> = new Observable<Dish[]>();
  selectedRelatedDishes: Dish[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('relatedDishInput')
  relatedDishInput?: ElementRef<HTMLInputElement>;

  quillModules: QuillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],
      ['link', 'image', 'video', 'formula'],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction

      [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ['clean'], // remove formatting button
    ],
    clipboard: {
      matchVisual: false, // Disable visual matching for better performance
    },
  };

  dishId?: string;
  isLoading = false;

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.dishId = id;
      if (id && id !== 'create') {
        this.isLoading = true;
        let foundDish: Dish;
        this.dishService
          .findOne(id)
          .pipe(
            finalize(() => (this.isLoading = false)),
            mergeMap((dish) => {
              foundDish = dish;
              this.dishForm.patchValue(dish);

              this.titleArray.clear();
              this.contentArray.clear();
              this.shortDescriptionArray.clear();

              dish.title.forEach((title) => {
                this.addLanguageField('title', title.lang, title.data);
              });
              dish.shortDescription.forEach((shortDescription) => {
                this.addLanguageField(
                  'shortDescription',
                  shortDescription.lang,
                  shortDescription.data
                );
              });
              dish.content.forEach((content) => {
                this.addLanguageField('content', content.lang, content.data);
              });

              const ingredients$ = dish.ingredients.map((ingredient) => {
                return this.ingredientService.findOne(ingredient.ingredientId);
              });

              const relatedDishes$ = dish.relatedDishes.map((relatedDish) => {
                return this.dishService.findOne(relatedDish);
              });

              return forkJoin({
                ingredients: forkJoin(ingredients$),
                relatedDishes: forkJoin(relatedDishes$),
              });
            })
          )
          .subscribe((res) => {
            this.ingredientsArray.clear();
            res.ingredients.forEach((ingredient) => {
              const found = foundDish.ingredients.find(
                (i) => i.ingredientId === ingredient._id
              );
              this.addIngredient(found, ingredient);
            });

            this.selectedRelatedDishes = res.relatedDishes;
          });
      }
    });
  }

  initForm(): void {
    this.dishForm = this.fb.group({
      slug: ['', Validators.required],
      title: this.fb.array([]),
      shortDescription: this.fb.array([]),
      content: this.fb.array([]),
      tags: [[]],
      preparationTime: [null],
      cookingTime: [null],
      difficultLevel: [''],
      mealCategories: [[]],
      ingredientCategories: [[]],
      thumbnail: [''],
      videos: this.fb.array([this.fb.control('')]),
      ingredients: this.fb.array([]),
      relatedDishes: [[]],
      labels: [[]],
    });

    // Initialize multilanguage arrays with default language
    this.availableLanguages.forEach((lang) => {
      this.addLanguageField('title', lang);
      this.addLanguageField('shortDescription', lang);
      this.addLanguageField('content', lang);
    });

    // Add at least one ingredient
    this.addIngredient();

    this.filteredDishes = this.relatedDishCtrl.valueChanges.pipe(
      debounceTime(300),
      startWith(null),
      switchMap((dishName: string | null) => {
        return dishName ? this._filterDishes(dishName) : [];
      })
    );

    // Initialize selectedRelatedDishes from your form
    if (this.dishForm.get('relatedDishes')?.value) {
      this.selectedRelatedDishes = this.dishForm.get('relatedDishes')?.value;
    }

    this.initIngredientAutocomplete();
  }

  private _filterDishes(value: string): Observable<Dish[]> {
    // If value is an object (a dish was selected), return empty array
    if (typeof value !== 'string') return of([]);

    const filterValue = value.toLowerCase();

    return this.dishService
      .findAll({ keyword: filterValue, page: 1, limit: 25 })
      .pipe(map((res) => res.data));
  }

  selectedRelatedDish(event: MatAutocompleteSelectedEvent): void {
    if (this.relatedDishInput) {
      this.selectedRelatedDishes.push(event.option.value);
      this.dishForm.get('relatedDishes')?.setValue(this.selectedRelatedDishes);
      this.relatedDishInput.nativeElement.value = '';
      this.relatedDishCtrl.setValue(null);
    }
  }

  removeRelatedDish(dish: any): void {
    const index = this.selectedRelatedDishes.indexOf(dish);
    if (index >= 0) {
      this.selectedRelatedDishes.splice(index, 1);
      this.dishForm.get('relatedDishes')?.setValue(this.selectedRelatedDishes);
    }
  }

  // Getters for form arrays
  get titleArray() {
    return this.dishForm.get('title') as FormArray;
  }

  get shortDescriptionArray() {
    return this.dishForm.get('shortDescription') as FormArray;
  }

  get contentArray() {
    return this.dishForm.get('content') as FormArray;
  }

  get videosArray() {
    return this.dishForm.get('videos') as FormArray;
  }

  get ingredientsArray() {
    return this.dishForm.get('ingredients') as FormArray;
  }

  get relatedDishesArray() {
    return this.dishForm.get('relatedDishes') as FormArray;
  }

  // Methods to add form controls
  addLanguageField(field: string, lang: string, data = ''): void {
    const array = this.dishForm.get(field) as FormArray;
    array.push(
      this.fb.group({
        lang: [lang],
        data: [data],
      })
    );
  }

  removeLanguageField(field: string, index: number): void {
    const array = this.dishForm.get(field) as FormArray;
    if (array.length > 1) {
      // Always keep at least one language
      array.removeAt(index);
    }
  }

  addVideo(): void {
    this.videosArray.push(this.fb.control(''));
  }

  removeVideo(index: number): void {
    this.videosArray.removeAt(index);
  }

  addIngredient(
    ingredientInDish: IngredientsInDish = {
      quantity: 0,
      slug: '',
      note: '',
      ingredientId: '',
    },
    ingredient?: Ingredient
  ): void {
    this.ingredientsArray.push(
      this.fb.group({
        quantity: [
          ingredientInDish.quantity,
          [Validators.required, Validators.min(0)],
        ],
        note: [ingredientInDish.note],
        ingredient: [ingredient, Validators.required],
      })
    );

    // Set up filter for the newly added ingredient
    this.ingredientsArray.controls.forEach((control, index) => {
      this.setupIngredientFilter(control, index);
    });
  }

  removeIngredient(index: number): void {
    this.ingredientsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.dishForm.valid) {
      const relatedDishes = this.selectedRelatedDishes.map((e: Dish) => e._id);

      const ingredients: IngredientsInDish[] = this.dishForm
        .get('ingredients')
        ?.value.map(
          (e: { quantity: number; note: string; ingredient: Ingredient }) => ({
            quantity: e.quantity,
            note: e.note,
            ingredientId: e.ingredient._id,
            slug: e.ingredient.slug,
          })
        );

      if (this.dishId && this.dishId !== 'create') {
        this.isLoading = true;
        const dto: UpdateDishDto = {
          ...this.dishForm.value,
          relatedDishes,
          ingredients,
        };
        this.dishService
          .update(this.dishId, dto)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe((res) => {
            this.toastService.showSuccess(
              $localize`Updated`,
              $localize`Dish ${
                res.title.find((e) => e.lang === 'en')?.data
              } updated successfully`,
              1500
            );
            this.router.navigate(['admin', 'dish']);
          });
      } else {
        const dto: CreateDishDto = {
          ...this.dishForm.value,
          relatedDishes,
          ingredients,
        };
        this.isLoading = true;
        this.dishService
          .create(dto)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe((res) => {
            this.toastService.showSuccess(
              $localize`Created`,
              $localize`Dish ${
                res.title.find((e) => e.lang === 'en')?.data
              } created successfully`,
              1500
            );
            this.router.navigate(['admin', 'dish']);
          });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.dishForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  removeCategory(category: string) {
    const mealCategories = this.dishForm.get('mealCategories')?.value || [];
    this.dishForm
      .get('mealCategories')
      ?.setValue(mealCategories.filter((c: string) => c !== category));
  }

  updateMealCategories(event: MatChipInputEvent) {
    const mealCategories = this.dishForm.get('mealCategories')?.value || [];
    this.dishForm
      .get('mealCategories')
      ?.setValue([...mealCategories, event.value]);
    event.value = '';
  }

  removeIngredientCategory(category: string) {
    const ingredientCategories =
      this.dishForm.get('ingredientCategories')?.value || [];
    this.dishForm
      .get('ingredientCategories')
      ?.setValue(ingredientCategories.filter((c: string) => c !== category));
  }

  updateIngredientCategories(event: MatChipInputEvent) {
    const ingredientCategories =
      this.dishForm.get('ingredientCategories')?.value || [];
    this.dishForm
      .get('ingredientCategories')
      ?.setValue([...ingredientCategories, event.value]);
    event.value = '';
  }

  removeTag(tag: string) {
    const tags = this.dishForm.get('tags')?.value || [];
    this.dishForm.get('tags')?.setValue(tags.filter((t: string) => t !== tag));
  }

  updateTags(event: MatChipInputEvent) {
    const tags = this.dishForm.get('tags')?.value || [];
    this.dishForm.get('tags')?.setValue([...tags, event.value]);
    event.chipInput.clear();
  }

  removeLabel(label: string) {
    const labels = this.dishForm.get('labels')?.value || [];
    this.dishForm
      .get('labels')
      ?.setValue(labels.filter((l: string) => l !== label));
  }

  updateLabel(event: MatChipInputEvent) {
    const labels = this.dishForm.get('labels')?.value || [];
    this.dishForm.get('labels')?.setValue([...labels, event.value]);
    event.chipInput.clear();
  }

  addRelatedDish(event: MatChipInputEvent) {
    this.dishForm
      .get('relatedDishes')
      ?.setValue([
        ...(this.dishForm.get('relatedDishes')?.value || []),
        event.value,
      ]);
    event.value = '';
  }

  previewImage(imageUrl: string): void {
    // Open image in dialog for larger view
    this.dialog.open(ImageViewerComponent, {
      data: imageUrl,
      width: '80%',
      maxWidth: '1200px',
      autoFocus: false,
    });
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/images/placeholder.png'; // Replace with your placeholder image
    event.target.classList.add('error-image');
  }

  // Preview video in dialog
  previewVideo(url: string): void {
    if (!url) return;

    const embedUrl = this.getVideoEmbedUrl(url);
    if (embedUrl) {
      this.dialog.open(VideoViewerComponent, {
        data: embedUrl,
        width: '80%',
        maxWidth: '1200px',
      });
    }
  }

  // Get embed URL for video preview
  getVideoEmbedUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;

    let embedUrl: string | null = null;

    // YouTube
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);

    if (youtubeMatch && youtubeMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);

    if (vimeoMatch && vimeoMatch[1]) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return embedUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl)
      : null;
  }

  initIngredientAutocomplete(): void {
    // Initialize filteredIngredients observable
    this.filteredIngredients = of([]); // Start with empty array

    // Set up listeners for each ingredient input when added
    this.ingredientsArray.controls.forEach((control, index) => {
      this.setupIngredientFilter(control, index);
    });
  }

  // Setup filter for a specific ingredient control
  setupIngredientFilter(control: AbstractControl, index: number): void {
    // Get the slug control from the form group
    const slugControl = control.get('ingredient');
    if (slugControl) {
      // Create an observable that reacts to input changes
      const filterObs = slugControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((keyword) => {
          if (typeof keyword === 'string' && keyword.length > 0) {
            // Call the ingredient service to search ingredients
            return this.ingredientService
              .findAll({
                keyword: keyword,
                page: 1,
                limit: 10,
              })
              .pipe(map((response) => response.data));
          }
          return of([]);
        })
      );

      // Assign the observable
      this.filteredIngredients = filterObs;
    }
  }

  // Handle ingredient selection from autocomplete
  selectIngredient(event: MatAutocompleteSelectedEvent, index: number): void {
    const selectedIngredient = event.option.value;
    const ingredientGroup = this.ingredientsArray.at(index) as FormGroup;
    ingredientGroup.patchValue({
      ingredient: selectedIngredient, // Assuming ingredient has _id property
    });
  }

  displayIngredient(ingredient: Ingredient): string {
    return ingredient
      ? ingredient.title.find((t) => t.lang === 'en')!.data
      : '';
  }
}
