import { EncodeURIComponentPipe } from './encode-uri.pipe';

describe('EncodeURIComponentPipe', () => {
  let pipe: EncodeURIComponentPipe;

  beforeEach(() => {
    pipe = new EncodeURIComponentPipe();
  });

  // ── creation ───────────────────────────────────────────────────────────────────
  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // ── plain strings ──────────────────────────────────────────────────────────────
  it('should return an alphanumeric string unchanged', () => {
    expect(pipe.transform('hello')).toBe('hello');
  });

  it('should return numeric string unchanged', () => {
    expect(pipe.transform('12345')).toBe('12345');
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  // ── special characters ─────────────────────────────────────────────────────────
  it('should encode spaces as %20', () => {
    expect(pipe.transform('hello world')).toBe('hello%20world');
  });

  it('should encode forward slash', () => {
    expect(pipe.transform('a/b')).toBe('a%2Fb');
  });

  it('should encode question mark', () => {
    expect(pipe.transform('a?b')).toBe('a%3Fb');
  });

  it('should encode ampersand', () => {
    expect(pipe.transform('a&b')).toBe('a%26b');
  });

  it('should encode equals sign', () => {
    expect(pipe.transform('a=b')).toBe('a%3Db');
  });

  it('should encode hash symbol', () => {
    expect(pipe.transform('a#b')).toBe('a%23b');
  });

  it('should encode plus sign', () => {
    expect(pipe.transform('a+b')).toBe('a%2Bb');
  });

  it('should encode at symbol', () => {
    expect(pipe.transform('user@example.com')).toBe('user%40example.com');
  });

  // ── URL-like inputs ────────────────────────────────────────────────────────────
  it('should encode a full URL string', () => {
    expect(pipe.transform('https://example.com/path?q=hello world')).toBe(
      'https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world'
    );
  });

  it('should encode a redirect URL query param', () => {
    const input = '/favorites?sort=asc&page=1';
    expect(pipe.transform(input)).toBe(encodeURIComponent(input));
  });

  // ── unicode ────────────────────────────────────────────────────────────────────
  it('should encode Vietnamese characters', () => {
    const result = pipe.transform('Phở bò');
    expect(result).toBe(encodeURIComponent('Phở bò'));
    expect(result).not.toContain(' ');
  });

  it('should encode emoji', () => {
    const result = pipe.transform('🍜');
    expect(result).toBe(encodeURIComponent('🍜'));
  });

  // ── unreserved characters (RFC 3986) should pass through unchanged ─────────────
  it('should not encode hyphen', () => {
    expect(pipe.transform('my-slug')).toBe('my-slug');
  });

  it('should not encode underscore', () => {
    expect(pipe.transform('my_slug')).toBe('my_slug');
  });

  it('should not encode tilde', () => {
    expect(pipe.transform('~value')).toBe('~value');
  });

  it('should not encode dot', () => {
    expect(pipe.transform('file.txt')).toBe('file.txt');
  });

  // ── result matches native encodeURIComponent ───────────────────────────────────
  it('transform result should always equal native encodeURIComponent output', () => {
    const inputs = [
      'simple',
      'hello world',
      'a/b?c=d&e=f',
      'cà phê sữa đá',
      '100% organic',
    ];
    inputs.forEach((input) =>
      expect(pipe.transform(input)).toBe(encodeURIComponent(input))
    );
  });
});
