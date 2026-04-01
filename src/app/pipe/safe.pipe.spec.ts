import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { BrowserModule } from '@angular/platform-browser';
import { SafePipe } from './safe.pipe';

describe('SafePipe', () => {
  let pipe: SafePipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BrowserModule] });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = TestBed.runInInjectionContext(() => new SafePipe());
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call bypassSecurityTrustHtml for type "html"', () => {
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    pipe.transform('<b>bold</b>', 'html');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<b>bold</b>');
  });

  it('should return the SafeHtml value for type "html"', () => {
    const fakeResult = {} as any;
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.returnValue(fakeResult);
    expect(pipe.transform('<b>bold</b>', 'html')).toBe(fakeResult);
  });

  it('should call bypassSecurityTrustStyle for type "style"', () => {
    spyOn(sanitizer, 'bypassSecurityTrustStyle').and.callThrough();
    pipe.transform('color: red', 'style');
    expect(sanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith('color: red');
  });

  it('should return the SafeStyle value for type "style"', () => {
    const fakeResult = {} as any;
    spyOn(sanitizer, 'bypassSecurityTrustStyle').and.returnValue(fakeResult);
    expect(pipe.transform('color: red', 'style')).toBe(fakeResult);
  });

  it('should call bypassSecurityTrustScript for type "script"', () => {
    spyOn(sanitizer, 'bypassSecurityTrustScript').and.callThrough();
    pipe.transform('alert(1)', 'script');
    expect(sanitizer.bypassSecurityTrustScript).toHaveBeenCalledWith('alert(1)');
  });

  it('should return the SafeScript value for type "script"', () => {
    const fakeResult = {} as any;
    spyOn(sanitizer, 'bypassSecurityTrustScript').and.returnValue(fakeResult);
    expect(pipe.transform('alert(1)', 'script')).toBe(fakeResult);
  });

  it('should call bypassSecurityTrustUrl for type "url"', () => {
    spyOn(sanitizer, 'bypassSecurityTrustUrl').and.callThrough();
    pipe.transform('https://example.com', 'url');
    expect(sanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith('https://example.com');
  });

  it('should return the SafeUrl value for type "url"', () => {
    const fakeResult = {} as any;
    spyOn(sanitizer, 'bypassSecurityTrustUrl').and.returnValue(fakeResult);
    expect(pipe.transform('https://example.com', 'url')).toBe(fakeResult);
  });

  it('should call bypassSecurityTrustResourceUrl for type "resourceUrl"', () => {
    spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.callThrough();
    pipe.transform('https://example.com/embed', 'resourceUrl');
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://example.com/embed');
  });

  it('should return the SafeResourceUrl value for type "resourceUrl"', () => {
    const fakeResult = {} as any;
    spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.returnValue(fakeResult);
    expect(pipe.transform('https://example.com/embed', 'resourceUrl')).toBe(fakeResult);
  });

  it('should throw an error for an unknown type', () => {
    expect(() => pipe.transform('value', 'unknown')).toThrowError(
      'Invalid safe type specified: unknown'
    );
  });

  it('should throw an error for an empty string type', () => {
    expect(() => pipe.transform('value', '')).toThrowError(
      'Invalid safe type specified: '
    );
  });

  it('should pass the exact value to the sanitizer method', () => {
    const htmlValue = '<div class="test">content</div>';
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    pipe.transform(htmlValue, 'html');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(htmlValue);
  });

  it('should handle empty string value', () => {
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    pipe.transform('', 'html');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('');
  });
});
