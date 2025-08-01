import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryTranslate',
  standalone: true,
})
export class CategoryTranslatePipe implements PipeTransform {
  transform(category: string): string {
    // Here you would implement your translation logic
    // This is a simple example
    const translations: { [key: string]: string } = {
      'MILK AND DAIRY': $localize`Milk & Dairy`,
      GRAINS: $localize`Grains`,
      'BEVERAGES NONALCOHOLIC': $localize`Beverages Nonalcoholic`,
      'PROTEIN FOODS': $localize`Protein Foods`,
      'SNACKS AND SWEETS': $localize`Snacks & sweets`,
      ALCOHOLIC_BEVERAGES: $localize`Alcoholic beverages`,
      WATER: $localize`Water`,
      'FATS AND OILS': $localize`Fats & oils`,
      'MIXED DISHES': $localize`Mixed dishes`,
      FRUIT: $localize`Fruit`,
      'CONDIMENTS AND SAUCES': $localize`Condiments & sauces`,
      SUGARS: $localize`Sugars`,
      VEGETABLES: $localize`Vegetables`,
      'INFANT FORMULA AND BABY FOOD': $localize`Infant formula & baby food`,
      OTHER: $localize`Other`,
      HARD: $localize`Hard`,
      MEDIUM: $localize`Medium`,
      EASY: $localize`Easy`,
      BREAKFAST: $localize`Breakfast`,
      LUNCH: $localize`Lunch`,
      BRUNCH: $localize`Brunch`,
      DINNER: $localize`Dinner`,
      BURGER: $localize`Burger`,
      SALAD: $localize`Salad`,
      SOUP: $localize`Soup`,
      APPETIZER: $localize`Appetizer`,
      DESSERT: $localize`Dessert`,
      HOTPOT: $localize`Hotpot`,
      NORTH_VN: $localize`North Vietnam`,
      CENTRAL_VN: $localize`Central Vietnam`,
      SOUTH_VN: $localize`South Vietnam`,
      SWEET_SOUP: $localize`Sweet soup`,
      VITAMIN: $localize`Vitamin`,
    };
    return translations[category] || category;
  }
}
