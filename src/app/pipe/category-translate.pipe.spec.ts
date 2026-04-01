import { CategoryTranslatePipe } from './category-translate.pipe';

describe('CategoryTranslatePipe', () => {
  let pipe: CategoryTranslatePipe;

  beforeEach(() => {
    pipe = new CategoryTranslatePipe();
  });

  // ── creation ───────────────────────────────────────────────────────────────────
  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // ── fallback ───────────────────────────────────────────────────────────────────
  it('should return the original string for an unknown category', () => {
    expect(pipe.transform('UNKNOWN_CATEGORY')).toBe('UNKNOWN_CATEGORY');
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  // ── ingredient categories ──────────────────────────────────────────────────────
  it('should translate MILK AND DAIRY', () => {
    expect(pipe.transform('MILK AND DAIRY')).toBeTruthy();
    expect(pipe.transform('MILK AND DAIRY')).not.toBe('MILK AND DAIRY');
  });

  it('should translate GRAINS', () => {
    expect(pipe.transform('GRAINS')).toBeTruthy();
    expect(pipe.transform('GRAINS')).not.toBe('GRAINS');
  });

  it('should translate PROTEIN FOODS', () => {
    expect(pipe.transform('PROTEIN FOODS')).toBeTruthy();
    expect(pipe.transform('PROTEIN FOODS')).not.toBe('PROTEIN FOODS');
  });

  it('should translate SNACKS AND SWEETS', () => {
    expect(pipe.transform('SNACKS AND SWEETS')).toBeTruthy();
    expect(pipe.transform('SNACKS AND SWEETS')).not.toBe('SNACKS AND SWEETS');
  });

  it('should translate FATS AND OILS', () => {
    expect(pipe.transform('FATS AND OILS')).toBeTruthy();
    expect(pipe.transform('FATS AND OILS')).not.toBe('FATS AND OILS');
  });

  it('should translate VEGETABLES', () => {
    expect(pipe.transform('VEGETABLES')).toBeTruthy();
    expect(pipe.transform('VEGETABLES')).not.toBe('VEGETABLES');
  });

  it('should translate FRUIT', () => {
    expect(pipe.transform('FRUIT')).toBeTruthy();
    expect(pipe.transform('FRUIT')).not.toBe('FRUIT');
  });

  it('should translate HERBS AND SPICES', () => {
    expect(pipe.transform('HERBS AND SPICES')).toBeTruthy();
    expect(pipe.transform('HERBS AND SPICES')).not.toBe('HERBS AND SPICES');
  });

  it('should translate NUTS AND SEEDS', () => {
    expect(pipe.transform('NUTS AND SEEDS')).toBeTruthy();
    expect(pipe.transform('NUTS AND SEEDS')).not.toBe('NUTS AND SEEDS');
  });

  it('should translate BEVERAGES NONALCOHOLIC', () => {
    expect(pipe.transform('BEVERAGES NONALCOHOLIC')).toBeTruthy();
    expect(pipe.transform('BEVERAGES NONALCOHOLIC')).not.toBe('BEVERAGES NONALCOHOLIC');
  });

  it('should translate ALCOHOLIC_BEVERAGES', () => {
    expect(pipe.transform('ALCOHOLIC_BEVERAGES')).toBeTruthy();
    expect(pipe.transform('ALCOHOLIC_BEVERAGES')).not.toBe('ALCOHOLIC_BEVERAGES');
  });

  it('should translate WATER', () => {
    expect(pipe.transform('WATER')).toBeTruthy();
    expect(pipe.transform('WATER')).not.toBe('WATER');
  });

  it('should translate MIXED DISHES', () => {
    expect(pipe.transform('MIXED DISHES')).toBeTruthy();
    expect(pipe.transform('MIXED DISHES')).not.toBe('MIXED DISHES');
  });

  it('should translate CONDIMENTS AND SAUCES', () => {
    expect(pipe.transform('CONDIMENTS AND SAUCES')).toBeTruthy();
    expect(pipe.transform('CONDIMENTS AND SAUCES')).not.toBe('CONDIMENTS AND SAUCES');
  });

  it('should translate SUGARS', () => {
    expect(pipe.transform('SUGARS')).toBeTruthy();
    expect(pipe.transform('SUGARS')).not.toBe('SUGARS');
  });

  it('should translate BAKING INGREDIENTS', () => {
    expect(pipe.transform('BAKING INGREDIENTS')).toBeTruthy();
    expect(pipe.transform('BAKING INGREDIENTS')).not.toBe('BAKING INGREDIENTS');
  });

  it('should translate CANNED AND PRESERVED', () => {
    expect(pipe.transform('CANNED AND PRESERVED')).toBeTruthy();
    expect(pipe.transform('CANNED AND PRESERVED')).not.toBe('CANNED AND PRESERVED');
  });

  it('should translate INFANT FORMULA AND BABY FOOD', () => {
    expect(pipe.transform('INFANT FORMULA AND BABY FOOD')).toBeTruthy();
    expect(pipe.transform('INFANT FORMULA AND BABY FOOD')).not.toBe('INFANT FORMULA AND BABY FOOD');
  });

  it('should translate OTHER', () => {
    expect(pipe.transform('OTHER')).toBeTruthy();
    expect(pipe.transform('OTHER')).not.toBe('OTHER');
  });

  // ── difficulty levels ──────────────────────────────────────────────────────────
  it('should translate HARD', () => {
    expect(pipe.transform('HARD')).toBeTruthy();
    expect(pipe.transform('HARD')).not.toBe('HARD');
  });

  it('should translate MEDIUM', () => {
    expect(pipe.transform('MEDIUM')).toBeTruthy();
    expect(pipe.transform('MEDIUM')).not.toBe('MEDIUM');
  });

  it('should translate EASY', () => {
    expect(pipe.transform('EASY')).toBeTruthy();
    expect(pipe.transform('EASY')).not.toBe('EASY');
  });

  // ── meal times ─────────────────────────────────────────────────────────────────
  it('should translate BREAKFAST', () => {
    expect(pipe.transform('BREAKFAST')).toBeTruthy();
    expect(pipe.transform('BREAKFAST')).not.toBe('BREAKFAST');
  });

  it('should translate LUNCH', () => {
    expect(pipe.transform('LUNCH')).toBeTruthy();
    expect(pipe.transform('LUNCH')).not.toBe('LUNCH');
  });

  it('should translate BRUNCH', () => {
    expect(pipe.transform('BRUNCH')).toBeTruthy();
    expect(pipe.transform('BRUNCH')).not.toBe('BRUNCH');
  });

  it('should translate DINNER', () => {
    expect(pipe.transform('DINNER')).toBeTruthy();
    expect(pipe.transform('DINNER')).not.toBe('DINNER');
  });

  it('should translate SNACK', () => {
    expect(pipe.transform('SNACK')).toBeTruthy();
    expect(pipe.transform('SNACK')).not.toBe('SNACK');
  });

  // ── dish types ─────────────────────────────────────────────────────────────────
  it('should translate BURGER', () => {
    expect(pipe.transform('BURGER')).toBeTruthy();
    expect(pipe.transform('BURGER')).not.toBe('BURGER');
  });

  it('should translate SALAD', () => {
    expect(pipe.transform('SALAD')).toBeTruthy();
    expect(pipe.transform('SALAD')).not.toBe('SALAD');
  });

  it('should translate SOUP', () => {
    expect(pipe.transform('SOUP')).toBeTruthy();
    expect(pipe.transform('SOUP')).not.toBe('SOUP');
  });

  it('should translate DESSERT', () => {
    expect(pipe.transform('DESSERT')).toBeTruthy();
    expect(pipe.transform('DESSERT')).not.toBe('DESSERT');
  });

  it('should translate HOTPOT', () => {
    expect(pipe.transform('HOTPOT')).toBeTruthy();
    expect(pipe.transform('HOTPOT')).not.toBe('HOTPOT');
  });

  it('should translate SWEET_SOUP', () => {
    expect(pipe.transform('SWEET_SOUP')).toBeTruthy();
    expect(pipe.transform('SWEET_SOUP')).not.toBe('SWEET_SOUP');
  });

  // ── main dish categories ───────────────────────────────────────────────────────
  it('should translate NOODLE', () => {
    expect(pipe.transform('NOODLE')).toBeTruthy();
    expect(pipe.transform('NOODLE')).not.toBe('NOODLE');
  });

  it('should translate RICE', () => {
    expect(pipe.transform('RICE')).toBeTruthy();
    expect(pipe.transform('RICE')).not.toBe('RICE');
  });

  it('should translate SEAFOOD', () => {
    expect(pipe.transform('SEAFOOD')).toBeTruthy();
    expect(pipe.transform('SEAFOOD')).not.toBe('SEAFOOD');
  });

  it('should translate MEAT', () => {
    expect(pipe.transform('MEAT')).toBeTruthy();
    expect(pipe.transform('MEAT')).not.toBe('MEAT');
  });

  it('should translate VEGETARIAN', () => {
    expect(pipe.transform('VEGETARIAN')).toBeTruthy();
    expect(pipe.transform('VEGETARIAN')).not.toBe('VEGETARIAN');
  });

  it('should translate VEGAN', () => {
    expect(pipe.transform('VEGAN')).toBeTruthy();
    expect(pipe.transform('VEGAN')).not.toBe('VEGAN');
  });

  // ── preparation styles ─────────────────────────────────────────────────────────
  it('should translate GRILLED', () => {
    expect(pipe.transform('GRILLED')).toBeTruthy();
    expect(pipe.transform('GRILLED')).not.toBe('GRILLED');
  });

  it('should translate FRIED', () => {
    expect(pipe.transform('FRIED')).toBeTruthy();
    expect(pipe.transform('FRIED')).not.toBe('FRIED');
  });

  it('should translate STEAMED', () => {
    expect(pipe.transform('STEAMED')).toBeTruthy();
    expect(pipe.transform('STEAMED')).not.toBe('STEAMED');
  });

  it('should translate BAKED', () => {
    expect(pipe.transform('BAKED')).toBeTruthy();
    expect(pipe.transform('BAKED')).not.toBe('BAKED');
  });

  // ── food styles/origins ────────────────────────────────────────────────────────
  it('should translate STREET_FOOD', () => {
    expect(pipe.transform('STREET_FOOD')).toBeTruthy();
    expect(pipe.transform('STREET_FOOD')).not.toBe('STREET_FOOD');
  });

  it('should translate FAST_FOOD', () => {
    expect(pipe.transform('FAST_FOOD')).toBeTruthy();
    expect(pipe.transform('FAST_FOOD')).not.toBe('FAST_FOOD');
  });

  it('should translate TRADITIONAL', () => {
    expect(pipe.transform('TRADITIONAL')).toBeTruthy();
    expect(pipe.transform('TRADITIONAL')).not.toBe('TRADITIONAL');
  });

  it('should translate FUSION', () => {
    expect(pipe.transform('FUSION')).toBeTruthy();
    expect(pipe.transform('FUSION')).not.toBe('FUSION');
  });

  // ── regional Vietnamese ────────────────────────────────────────────────────────
  it('should translate NORTH_VN', () => {
    expect(pipe.transform('NORTH_VN')).toBeTruthy();
    expect(pipe.transform('NORTH_VN')).not.toBe('NORTH_VN');
  });

  it('should translate CENTRAL_VN', () => {
    expect(pipe.transform('CENTRAL_VN')).toBeTruthy();
    expect(pipe.transform('CENTRAL_VN')).not.toBe('CENTRAL_VN');
  });

  it('should translate SOUTH_VN', () => {
    expect(pipe.transform('SOUTH_VN')).toBeTruthy();
    expect(pipe.transform('SOUTH_VN')).not.toBe('SOUTH_VN');
  });

  // ── beverages & others ─────────────────────────────────────────────────────────
  it('should translate BEVERAGE', () => {
    expect(pipe.transform('BEVERAGE')).toBeTruthy();
    expect(pipe.transform('BEVERAGE')).not.toBe('BEVERAGE');
  });

  it('should translate SMOOTHIE', () => {
    expect(pipe.transform('SMOOTHIE')).toBeTruthy();
    expect(pipe.transform('SMOOTHIE')).not.toBe('SMOOTHIE');
  });

  it('should translate VITAMIN', () => {
    expect(pipe.transform('VITAMIN')).toBeTruthy();
    expect(pipe.transform('VITAMIN')).not.toBe('VITAMIN');
  });

  it('should translate APPETIZER', () => {
    expect(pipe.transform('APPETIZER')).toBeTruthy();
    expect(pipe.transform('APPETIZER')).not.toBe('APPETIZER');
  });
});
