import { MultiLanguagePipe } from './multi-language.pipe';
import { MultiLanguage } from '@/types/base.type';

describe('MultiLanguagePipe', () => {
  let pipe: MultiLanguagePipe;

  const entries: MultiLanguage<string>[] = [
    { lang: 'en', data: 'Hello' },
    { lang: 'vi', data: 'Xin chào' },
    { lang: 'fr', data: 'Bonjour' },
  ];

  beforeEach(() => {
    pipe = new MultiLanguagePipe();
  });

  // ── creation ───────────────────────────────────────────────────────────────────
  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // ── match found ────────────────────────────────────────────────────────────────
  it('should return the entry matching the requested language', () => {
    expect(pipe.transform(entries, 'en')).toEqual({ lang: 'en', data: 'Hello' });
  });

  it('should return the correct entry for Vietnamese', () => {
    expect(pipe.transform(entries, 'vi')).toEqual({ lang: 'vi', data: 'Xin chào' });
  });

  it('should return the correct entry for French', () => {
    expect(pipe.transform(entries, 'fr')).toEqual({ lang: 'fr', data: 'Bonjour' });
  });

  it('should return the full MultiLanguage object including lang and data', () => {
    const result = pipe.transform(entries, 'en');
    expect(result?.lang).toBe('en');
    expect(result?.data).toBe('Hello');
  });

  // ── no match ───────────────────────────────────────────────────────────────────
  it('should return undefined when the language is not found', () => {
    expect(pipe.transform(entries, 'de')).toBeUndefined();
  });

  it('should return undefined for an empty language string', () => {
    expect(pipe.transform(entries, '')).toBeUndefined();
  });

  it('should return undefined when the array is empty', () => {
    expect(pipe.transform([], 'en')).toBeUndefined();
  });

  it('should return undefined when no language arg is passed', () => {
    expect(pipe.transform(entries)).toBeUndefined();
  });

  // ── single-entry array ─────────────────────────────────────────────────────────
  it('should return the entry when the array has only one matching element', () => {
    const single = [{ lang: 'en', data: 'Only one' }];
    expect(pipe.transform(single, 'en')).toEqual({ lang: 'en', data: 'Only one' });
  });

  it('should return undefined for a single-entry array with a different lang', () => {
    const single = [{ lang: 'en', data: 'Only one' }];
    expect(pipe.transform(single, 'vi')).toBeUndefined();
  });

  // ── numeric data type ──────────────────────────────────────────────────────────
  it('should work with numeric data values', () => {
    const numEntries: MultiLanguage<number>[] = [
      { lang: 'en', data: 42 },
      { lang: 'vi', data: 99 },
    ];
    expect(pipe.transform(numEntries, 'en')?.data).toBe(42);
    expect(pipe.transform(numEntries, 'vi')?.data).toBe(99);
  });

  // ── object data type ───────────────────────────────────────────────────────────
  it('should work with object data values', () => {
    const objEntries: MultiLanguage<{ title: string }>[] = [
      { lang: 'en', data: { title: 'Dish A' } },
    ];
    expect(pipe.transform(objEntries, 'en')?.data).toEqual({ title: 'Dish A' });
  });

  // ── first match wins ───────────────────────────────────────────────────────────
  it('should return the first match when duplicate lang entries exist', () => {
    const dupes: MultiLanguage<string>[] = [
      { lang: 'en', data: 'First' },
      { lang: 'en', data: 'Second' },
    ];
    expect(pipe.transform(dupes, 'en')?.data).toBe('First');
  });

  // ── case sensitivity ───────────────────────────────────────────────────────────
  it('should be case-sensitive and not match EN for en', () => {
    expect(pipe.transform(entries, 'EN')).toBeUndefined();
  });
});
