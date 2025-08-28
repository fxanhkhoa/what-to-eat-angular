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
      // Time-based meals
      BREAKFAST: $localize`Breakfast`,
      LUNCH: $localize`Lunch`,
      BRUNCH: $localize`Brunch`,
      DINNER: $localize`Dinner`,
      SNACK: $localize`Snack`,

      // Dish types  
      BURGER: $localize`Burger`,
      SALAD: $localize`Salad`,
      SOUP: $localize`Soup`,
      APPETIZER: $localize`Appetizer`,
      DESSERT: $localize`Dessert`,
      HOTPOT: $localize`Hotpot`,
      SWEET_SOUP: $localize`Sweet soup`,
      
      // Main dish categories
      NOODLE: $localize`Noodle`,
      RICE: $localize`Rice dish`,
      SEAFOOD: $localize`Seafood`,
      MEAT: $localize`Meat`,
      VEGETARIAN: $localize`Vegetarian`,
      VEGAN: $localize`Vegan`,
      
      // Preparation styles
      GRILLED: $localize`Grilled`,
      FRIED: $localize`Fried`,
      STEAMED: $localize`Steamed`,
      BAKED: $localize`Baked`,
      
      // Food styles/origins
      STREET_FOOD: $localize`Street food`,
      FAST_FOOD: $localize`Fast food`,
      TRADITIONAL: $localize`Traditional`,
      FUSION: $localize`Fusion`,
      
      // Regional Vietnamese
      NORTH_VN: $localize`North Vietnam`,
      CENTRAL_VN: $localize`Central Vietnam`,
      SOUTH_VN: $localize`South Vietnam`,
      
      // Beverages & Others
      BEVERAGE: $localize`Beverage`,
      SMOOTHIE: $localize`Smoothie`,
      VITAMIN: $localize`Vitamin`,
    };
    return translations[category] || category;
  }
}
