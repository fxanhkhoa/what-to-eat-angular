import { MultiLanguage } from '@/types/base.type';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiLanguage',
})
export class MultiLanguagePipe implements PipeTransform {
  transform<T>(
    values: MultiLanguage<T>[],
    ...args: string[]
  ): MultiLanguage<T> | undefined {
    const found = values.find((v) => v.lang === args[0]);
    return found;
  }
}
