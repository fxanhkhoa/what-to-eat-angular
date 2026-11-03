import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ShareDialogComponent } from './share-dialog.component';
import { EncodeURIComponentPipe } from '@/app/pipe/encode-uri.pipe';

@Component({ selector: 'mat-icon', template: '', standalone: true })
class MatIconStub {}

@Component({
  selector: 'mat-form-field',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MatFormFieldStub {}

describe('ShareDialogComponent', () => {
  let component: ShareDialogComponent;
  let fixture: ComponentFixture<ShareDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ShareDialogComponent>>;
  let clipboard: jasmine.SpyObj<Clipboard>;
  let iconRegistry: jasmine.SpyObj<MatIconRegistry>;

  const testUrl = 'https://example.com/voting/abc123';

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    clipboard = jasmine.createSpyObj('Clipboard', ['copy']);
    iconRegistry = jasmine.createSpyObj('MatIconRegistry', ['addSvgIcon']);

    await TestBed.configureTestingModule({
      imports: [ShareDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { url: testUrl } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: Clipboard, useValue: clipboard },
        { provide: MatIconRegistry, useValue: iconRegistry },
      ],
    })
      .overrideComponent(ShareDialogComponent, {
        set: {
          imports: [EncodeURIComponentPipe, MatIconStub, MatFormFieldStub],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    // Spy on real DomSanitizer BEFORE component creation so constructor calls are tracked
    const sanitizer = TestBed.inject(DomSanitizer);
    spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.callThrough();

    fixture = TestBed.createComponent(ShareDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set shareUrl from MAT_DIALOG_DATA', () => {
    expect(component.shareUrl).toBe(testUrl);
  });

  it('should initialize copied to false', () => {
    expect(component.copied).toBeFalse();
  });

  // ---- constructor - SVG icon registration --------------------------------

  describe('constructor', () => {
    it('should register facebook SVG icon', () => {
      expect(iconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'facebook',
        jasmine.anything()
      );
    });

    it('should register telegram SVG icon', () => {
      expect(iconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'telegram',
        jasmine.anything()
      );
    });

    it('should register x-social SVG icon', () => {
      expect(iconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'x-social',
        jasmine.anything()
      );
    });

    it('should register exactly 3 icons', () => {
      expect(iconRegistry.addSvgIcon).toHaveBeenCalledTimes(3);
    });

    it('should call bypassSecurityTrustResourceUrl for each icon', () => {
      const sanitizer = TestBed.inject(DomSanitizer);
      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledTimes(3);
    });

    it('should use correct path for facebook icon', () => {
      const sanitizer = TestBed.inject(DomSanitizer);
      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        '/assets/icons/facebook.svg'
      );
    });

    it('should use correct path for telegram icon', () => {
      const sanitizer = TestBed.inject(DomSanitizer);
      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        '/assets/icons/telegram.svg'
      );
    });

    it('should use correct path for x-social icon', () => {
      const sanitizer = TestBed.inject(DomSanitizer);
      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        '/assets/icons/x-social.svg'
      );
    });
  });

  // ---- copyLink() ---------------------------------------------------------

  describe('copyLink()', () => {
    it('should copy shareUrl to clipboard', () => {
      component.copyLink();
      expect(clipboard.copy).toHaveBeenCalledWith(testUrl);
    });

    it('should set copied to true immediately', () => {
      component.copyLink();
      expect(component.copied).toBeTrue();
    });

    it('should reset copied to false after 2000ms', fakeAsync(() => {
      component.copyLink();
      expect(component.copied).toBeTrue();
      tick(2000);
      expect(component.copied).toBeFalse();
    }));

    it('should not reset copied before 2000ms have elapsed', fakeAsync(() => {
      component.copyLink();
      tick(1999);
      expect(component.copied).toBeTrue();
      tick(1); // consume the timer
    }));
  });

  // ---- openInNewTab() -----------------------------------------------------

  describe('openInNewTab()', () => {
    it('should open shareUrl in a new tab', () => {
      spyOn(window, 'open');
      component.openInNewTab();
      expect(window.open).toHaveBeenCalledWith(testUrl, '_blank');
    });
  });

  // ---- close() ------------------------------------------------------------

  describe('close()', () => {
    it('should call dialogRef.close()', () => {
      component.close();
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });
  });

  // ---- template -----------------------------------------------------------

  describe('template', () => {
    it('should display the share URL in the input', () => {
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe(testUrl);
    });

    it('should have a readonly input', () => {
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.readOnly).toBeTrue();
    });

    it('should call copyLink when copy button is clicked', () => {
      spyOn(component, 'copyLink');
      const copyBtn = fixture.debugElement.query(
        By.css('button[title="Copy link"]')
      );
      copyBtn.nativeElement.click();
      expect(component.copyLink).toHaveBeenCalled();
    });

    it('should call openInNewTab when open-in-new-tab button is clicked', () => {
      spyOn(component, 'openInNewTab');
      const openBtn = fixture.debugElement.query(
        By.css('button[title="Open in new tab"]')
      );
      openBtn.nativeElement.click();
      expect(component.openInNewTab).toHaveBeenCalled();
    });

    it('should call close when close button is clicked', () => {
      spyOn(component, 'close');
      const closeBtn = fixture.debugElement.query(
        By.css('button[mat-stroked-button]')
      );
      closeBtn.nativeElement.click();
      expect(component.close).toHaveBeenCalled();
    });

    it('should render Facebook share link with encoded URL', () => {
      const link = fixture.debugElement.query(
        By.css('a[title="Share on Facebook"]')
      );
      const href = link.nativeElement.getAttribute('href');
      expect(href).toContain('facebook.com/sharer/sharer.php?u=');
      expect(href).toContain(encodeURIComponent(testUrl));
    });

    it('should render Twitter/X share link with encoded URL', () => {
      const link = fixture.debugElement.query(
        By.css('a[title="Share on X"]')
      );
      const href = link.nativeElement.getAttribute('href');
      expect(href).toContain('twitter.com/intent/tweet?url=');
      expect(href).toContain(encodeURIComponent(testUrl));
    });

    it('should render Telegram share link with encoded URL', () => {
      const link = fixture.debugElement.query(
        By.css('a[title="Share on Telegram"]')
      );
      const href = link.nativeElement.getAttribute('href');
      expect(href).toContain('t.me/share/url?url=');
      expect(href).toContain(encodeURIComponent(testUrl));
    });

    it('should open all social links in a new tab', () => {
      const links = fixture.debugElement.queryAll(By.css('a'));
      links.forEach((link) => {
        expect(link.nativeElement.getAttribute('target')).toBe('_blank');
      });
    });

    it('should render the heading "Share Voting Session"', () => {
      const heading = fixture.debugElement.query(By.css('h2'));
      expect(heading.nativeElement.textContent).toContain('Share Voting Session');
    });
  });
});
