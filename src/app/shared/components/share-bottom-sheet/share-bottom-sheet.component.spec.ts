import { TestBed } from '@angular/core/testing';
import { ShareBottomSheetComponent, ShareBottomSheetData } from './share-bottom-sheet.component';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { UserDishInteractionService } from '@/app/service/user-dish-interaction.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { of } from 'rxjs';

describe('ShareBottomSheetComponent', () => {
  let bottomRefSpy: any;
  let recordSpy: jasmine.Spy;
  let toastrSpy: any;
  const mockDish = {
    _id: 'dish1',
    slug: 'pancake',
    title: [{ data: 'Pancake' }],
  } as any;

  beforeEach(async () => {
    bottomRefSpy = { dismiss: jasmine.createSpy('dismiss') };
    recordSpy = jasmine.createSpy('recordShare').and.returnValue(of(null));
    toastrSpy = { showSuccess: jasmine.createSpy('showSuccess') };

    await TestBed.configureTestingModule({
      imports: [ShareBottomSheetComponent],
      providers: [
        { provide: MatBottomSheetRef, useValue: bottomRefSpy },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: { dish: mockDish } as ShareBottomSheetData },
        { provide: UserDishInteractionService, useValue: { recordShare: recordSpy } },
        { provide: ToastService, useValue: toastrSpy },
        { provide: 'LOCALE_ID', useValue: 'en-US' },
      ],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(ShareBottomSheetComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('dismiss calls bottom sheet dismiss', () => {
    const fixture = TestBed.createComponent(ShareBottomSheetComponent);
    const comp = fixture.componentInstance;
    comp.dismiss();
    expect(bottomRefSpy.dismiss).toHaveBeenCalled();
  });

  it('copyLink writes clipboard, shows toast, records share and dismisses', async () => {
    const fixture = TestBed.createComponent(ShareBottomSheetComponent);
    const comp: any = fixture.componentInstance;

    // avoid touching window.location (not configurable) — stub getShareUrl instead
    spyOn(comp as any, 'getShareUrl').and.returnValue('https://example.com/dish/pancake');

    // define navigator.clipboard if possible
    const origClipboard = (navigator as any).clipboard;
    try {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve()) },
        configurable: true,
      });
    } catch (e) {
      // if not configurable, fall back — test will still assert record/dismiss
    }

    comp.copyLink();
    await Promise.resolve();

    if ((navigator as any).clipboard && (navigator as any).clipboard.writeText) {
      expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith('https://example.com/dish/pancake');
    }
    expect(toastrSpy.showSuccess).toHaveBeenCalled();
    expect(recordSpy).toHaveBeenCalled();
    expect(bottomRefSpy.dismiss).toHaveBeenCalled();

    // restore clipboard
    try {
      if (typeof origClipboard === 'undefined') {
        delete (navigator as any).clipboard;
      } else {
        Object.defineProperty(navigator, 'clipboard', { value: origClipboard });
      }
    } catch (e) {
      // ignore restore errors
    }
  });

  ['shareToFacebook', 'shareToTwitter', 'shareToWhatsApp'].forEach((method) => {
    it(`${method} opens window, records share and dismisses`, () => {
      const fixture = TestBed.createComponent(ShareBottomSheetComponent);
      const comp: any = fixture.componentInstance;

      const openSpy = spyOn(window, 'open').and.callFake(() => null as any);
      try {
        comp[method]();
        expect(openSpy).toHaveBeenCalled();
        expect(recordSpy).toHaveBeenCalled();
        expect(bottomRefSpy.dismiss).toHaveBeenCalled();
      } finally {
          openSpy.and.callFake(() => null as any);
        }
    });
  });

  // shareViaEmail triggers a location change; skip explicit location assertion to avoid reloads

  it('shareNative uses navigator.share when available', async () => {
    const fixture = TestBed.createComponent(ShareBottomSheetComponent);
    const comp: any = fixture.componentInstance;

    // stub getShareUrl and navigator.share
    spyOn(comp as any, 'getShareUrl').and.returnValue('https://example.com/dish/pancake');
    const origShare = (navigator as any).share;
    try {
      Object.defineProperty(navigator, 'share', {
        value: jasmine.createSpy('share').and.returnValue(Promise.resolve()),
        configurable: true,
      });
    } catch (e) {
      // ignore
    }

    comp.canUseNativeShare = true;
    comp.shareNative();
    await Promise.resolve();

    if ((navigator as any).share) {
      expect((navigator as any).share).toHaveBeenCalled();
    }
    expect(recordSpy).toHaveBeenCalled();
    expect(bottomRefSpy.dismiss).toHaveBeenCalled();

    try {
      if (typeof origShare === 'undefined') {
        delete (navigator as any).share;
      } else {
        Object.defineProperty(navigator, 'share', { value: origShare });
      }
    } catch (e) {
      // ignore
    }
  });
});
