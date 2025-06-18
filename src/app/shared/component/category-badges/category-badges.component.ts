// category-badges.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryTranslatePipe } from "@/app/pipe/category-translate.pipe";

@Component({
  selector: 'app-category-badges',
  standalone: true,
  imports: [CommonModule, CategoryTranslatePipe],
  templateUrl: './category-badges.component.html',
  styleUrls: ['./category-badges.component.scss'],
})
export class CategoryBadgesComponent {
  @Input() categories: string[] = [];
  @Input() useColorPalette: boolean = false;

  // Theme colors array - you can customize these colors
  themeColors = [
    'bg-[#F3A446] text-white',           // Main theme color - amber/orange
    'bg-[#F7B76B] text-gray-800',        // Lighter amber
    'bg-[#DE8A2A] text-white',           // Darker amber
    'bg-[#8A6E45] text-white',           // Brown (complementary)
    'bg-[#4682B4] text-white',           // Steel blue (contrasting)
    'bg-[#6B8E23] text-white',           // Olive green (complementary)
    'bg-[#9370DB] text-white',           // Medium purple (contrasting)
    'bg-[#CD5C5C] text-white',           // Indian red (accent)
    'bg-[#2F4F4F] text-white',           // Dark slate gray (neutral)
    'bg-[#F08080] text-gray-800'         // Light coral (accent)
  ];

  getColorForCategory(category: string): string {
    if (!this.useColorPalette) {
      return 'bg-[#2a2a2a]';
    }
    // Use the category string to deterministically pick a color
    const index = Math.abs(this.hashCode(category) % this.themeColors.length);
    return this.themeColors[index];
  }

  // Simple hash function for strings
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }
}
