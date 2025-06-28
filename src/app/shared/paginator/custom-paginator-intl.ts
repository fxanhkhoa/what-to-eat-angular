import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

@Injectable()
export class CustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = $localize`:@@firstPageLabel:First page`;
  itemsPerPageLabel = $localize`:@@itemsPerPageLabel:Items per page:`;
  lastPageLabel = $localize`:@@lastPageLabel:Last page`;

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = $localize`:@@nextPageLabel:Next page`;
  previousPageLabel = $localize`:@@previousPageLabel:Previous page`;

  getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ): string => {
    if (length === 0) {
      return $localize`:@@paginatorNoData:0 of ${length}`;
    }

    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;

    return $localize`:@@paginatorRangeLabel:${
      startIndex + 1
    } - ${endIndex} of ${length}`;
  };
}
