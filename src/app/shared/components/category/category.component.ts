import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-category',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-wrap gap-1 mt-2">
      @for (category of categories; track category) {
        <span
          class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
          {{ category }}
        </span>
      }
    </div>
    `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CategoryComponent {
  @Input() categories: string[] = [];
}
