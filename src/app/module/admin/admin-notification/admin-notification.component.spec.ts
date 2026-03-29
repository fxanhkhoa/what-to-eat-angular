import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PLATFORM_ID } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AdminNotificationComponent } from './admin-notification.component';
import { PushNotificationService } from '@/app/service/push-notification.service';
import { NotificationTemplate, AdminNotificationLog } from '@/types/notification.type';

const mockTemplate: NotificationTemplate = {
  _id: 'tmpl-1',
  name: 'Welcome',
  title: 'Welcome!',
  body: 'Hello there',
  imageUrl: 'https://example.com/img.png',
  type: 'marketing',
  createdAt: '2024-01-01',
};

const mockLog: AdminNotificationLog = {
  _id: 'log-1',
  title: 'Promo',
  body: 'Check this out',
  type: 'marketing',
  sentTo: 'all',
  totalSent: 100,
  totalFailed: 2,
};

describe('AdminNotificationComponent', () => {
  let component: AdminNotificationComponent;
  let fixture: ComponentFixture<AdminNotificationComponent>;
  let notifServiceMock: jasmine.SpyObj<PushNotificationService>;
  let snackBarOpen: jasmine.Spy;

  beforeEach(async () => {
    notifServiceMock = jasmine.createSpyObj('PushNotificationService', [
      'sendBroadcast',
      'sendSegment',
      'getTemplates',
      'createTemplate',
      'updateTemplate',
      'deleteTemplate',
      'getAdminLogs',
    ]);
    notifServiceMock.sendBroadcast.and.returnValue(of({ message: 'Sent' }));
    notifServiceMock.sendSegment.and.returnValue(of({ message: 'Sent' }));
    notifServiceMock.getTemplates.and.returnValue(
      of({ data: [mockTemplate], count: 1 })
    );
    notifServiceMock.createTemplate.and.returnValue(of(mockTemplate));
    notifServiceMock.updateTemplate.and.returnValue(of(mockTemplate));
    notifServiceMock.deleteTemplate.and.returnValue(of({ message: 'Deleted' }));
    notifServiceMock.getAdminLogs.and.returnValue(
      of({ data: [mockLog], count: 1 })
    );

    await TestBed.configureTestingModule({
      imports: [AdminNotificationComponent, NoopAnimationsModule],
      providers: [
        { provide: PushNotificationService, useValue: notifServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminNotificationComponent);
    component = fixture.componentInstance;
    snackBarOpen = spyOn((component as any).snackBar, 'open');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('should call loadTemplates and loadLogs on browser platform', () => {
      expect(notifServiceMock.getTemplates).toHaveBeenCalled();
      expect(notifServiceMock.getAdminLogs).toHaveBeenCalled();
    });

    it('should NOT call loadTemplates or loadLogs on server platform', async () => {
      await TestBed.resetTestingModule();
      notifServiceMock.getTemplates.calls.reset();
      notifServiceMock.getAdminLogs.calls.reset();

      await TestBed.configureTestingModule({
        imports: [AdminNotificationComponent, NoopAnimationsModule],
        providers: [
          { provide: PushNotificationService, useValue: notifServiceMock },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      const serverFixture = TestBed.createComponent(AdminNotificationComponent);
      spyOn((serverFixture.componentInstance as any).snackBar, 'open');
      serverFixture.detectChanges();

      expect(notifServiceMock.getTemplates).not.toHaveBeenCalled();
      expect(notifServiceMock.getAdminLogs).not.toHaveBeenCalled();
    });
  });

  // ─── Form initialization ──────────────────────────────────────────────────

  describe('composeForm', () => {
    it('should create composeForm with all controls', () => {
      expect(component.composeForm.get('title')).toBeTruthy();
      expect(component.composeForm.get('body')).toBeTruthy();
      expect(component.composeForm.get('type')).toBeTruthy();
      expect(component.composeForm.get('imageUrl')).toBeTruthy();
      expect(component.composeForm.get('scheduledAt')).toBeTruthy();
      expect(component.composeForm.get('roleNames')).toBeTruthy();
      expect(component.composeForm.get('inactiveDays')).toBeTruthy();
    });

    it('should be invalid when required fields are empty', () => {
      component.composeForm.get('title')?.setValue('');
      component.composeForm.get('body')?.setValue('');
      expect(component.composeForm.valid).toBeFalse();
    });
  });

  describe('templateForm', () => {
    it('should create templateForm with all controls', () => {
      expect(component.templateForm.get('name')).toBeTruthy();
      expect(component.templateForm.get('title')).toBeTruthy();
      expect(component.templateForm.get('body')).toBeTruthy();
      expect(component.templateForm.get('type')).toBeTruthy();
      expect(component.templateForm.get('imageUrl')).toBeTruthy();
    });

    it('should default type to "marketing"', () => {
      expect(component.templateForm.get('type')?.value).toBe('marketing');
    });
  });

  // ─── setSendTarget ────────────────────────────────────────────────────────

  describe('setSendTarget()', () => {
    it('should set sendTarget to "all"', () => {
      component.setSendTarget('all');
      expect(component.sendTarget).toBe('all');
    });

    it('should set sendTarget to "segment"', () => {
      component.setSendTarget('segment');
      expect(component.sendTarget).toBe('segment');
    });
  });

  // ─── loadFromTemplate ────────────────────────────────────────────────────

  describe('loadFromTemplate()', () => {
    it('should patch composeForm with template values', () => {
      component.loadFromTemplate(mockTemplate);
      expect(component.composeForm.get('title')?.value).toBe(mockTemplate.title);
      expect(component.composeForm.get('body')?.value).toBe(mockTemplate.body);
      expect(component.composeForm.get('type')?.value).toBe(mockTemplate.type);
    });

    it('should open a snackbar confirming the template was loaded', () => {
      component.loadFromTemplate(mockTemplate);
      expect(snackBarOpen).toHaveBeenCalledWith(
        `Loaded template "${mockTemplate.name}"`,
        'OK',
        jasmine.any(Object)
      );
    });
  });

  // ─── send ────────────────────────────────────────────────────────────────

  describe('send()', () => {
    function fillComposeForm() {
      component.composeForm.patchValue({ title: 'Hello', body: 'World', type: 'marketing' });
    }

    it('should mark form as touched when form is invalid', () => {
      component.composeForm.get('title')?.setValue('');
      component.send();
      expect(component.composeForm.touched).toBeTrue();
    });

    it('should call sendBroadcast when sendTarget is "all"', () => {
      fillComposeForm();
      component.setSendTarget('all');
      component.send();
      expect(notifServiceMock.sendBroadcast).toHaveBeenCalled();
    });

    it('should call sendSegment when sendTarget is "segment"', () => {
      fillComposeForm();
      component.setSendTarget('segment');
      component.send();
      expect(notifServiceMock.sendSegment).toHaveBeenCalled();
    });

    it('should pass parsed roleNames to sendSegment', () => {
      fillComposeForm();
      component.composeForm.get('roleNames')?.setValue('admin, user');
      component.setSendTarget('segment');
      component.send();
      expect(notifServiceMock.sendSegment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          segmentFilter: jasmine.objectContaining({ roleNames: ['admin', 'user'] }),
        })
      );
    });

    it('should pass inactiveDays as a number to sendSegment', () => {
      fillComposeForm();
      component.composeForm.get('inactiveDays')?.setValue('7');
      component.setSendTarget('segment');
      component.send();
      expect(notifServiceMock.sendSegment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          segmentFilter: jasmine.objectContaining({ inactiveDays: 7 }),
        })
      );
    });

    it('should show a success snackBar and reload logs after send', () => {
      fillComposeForm();
      notifServiceMock.getAdminLogs.calls.reset();
      component.send();
      expect(snackBarOpen).toHaveBeenCalledWith('Sent', 'OK', jasmine.any(Object));
      expect(notifServiceMock.getAdminLogs).toHaveBeenCalled();
    });

    it('should reset sending signal to false after send', () => {
      fillComposeForm();
      component.send();
      expect(component.sending()).toBeFalse();
    });

    it('should show an error snackbar when send fails', () => {
      fillComposeForm();
      notifServiceMock.sendBroadcast.and.returnValue(throwError(() => ({ message: 'Network error' })));
      component.send();
      expect(snackBarOpen).toHaveBeenCalledWith('Network error', 'Dismiss', jasmine.any(Object));
    });

    it('should build a scheduledAt ISO string when scheduledAt is set', () => {
      fillComposeForm();
      component.composeForm.get('scheduledAt')?.setValue(new Date('2025-06-01'));
      component.composeForm.get('scheduledHour')?.setValue('10');
      component.composeForm.get('scheduledMinute')?.setValue('30');
      component.send();
      const callArgs = notifServiceMock.sendBroadcast.calls.mostRecent().args[0];
      expect(callArgs.scheduledAt).toBeDefined();
      expect(callArgs.scheduledAt).toContain('2025-06-01');
    });
  });

  // ─── loadTemplates ───────────────────────────────────────────────────────

  describe('loadTemplates()', () => {
    it('should call getTemplates with current page and limit', () => {
      notifServiceMock.getTemplates.calls.reset();
      component.loadTemplates();
      expect(notifServiceMock.getTemplates).toHaveBeenCalledWith(
        component.templatePage(),
        component.templateLimit()
      );
    });

    it('should populate templateDataSource with the response data', () => {
      expect(component.templateDataSource.data.length).toBe(1);
      expect(component.templateDataSource.data[0]._id).toBe('tmpl-1');
    });

    it('should update templateTotal signal', () => {
      expect(component.templateTotal()).toBe(1);
    });

    it('should populate templates signal', () => {
      expect(component.templates().length).toBe(1);
    });

    it('should set loadingTemplates to false after load', () => {
      expect(component.loadingTemplates()).toBeFalse();
    });

    it('should show snackbar on error', () => {
      notifServiceMock.getTemplates.and.returnValue(
        throwError(() => ({ message: 'Server error' }))
      );
      component.loadTemplates();
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Server error',
        'Dismiss',
        jasmine.any(Object)
      );
    });
  });

  // ─── onTemplatePage ───────────────────────────────────────────────────────

  describe('onTemplatePage()', () => {
    it('should update page and limit signals and reload templates', () => {
      notifServiceMock.getTemplates.calls.reset();
      const event: PageEvent = { pageIndex: 1, pageSize: 5, length: 20 };
      component.onTemplatePage(event);
      expect(component.templatePage()).toBe(2);
      expect(component.templateLimit()).toBe(5);
      expect(notifServiceMock.getTemplates).toHaveBeenCalled();
    });
  });

  // ─── editTemplate ─────────────────────────────────────────────────────────

  describe('editTemplate()', () => {
    it('should set editingTemplateId to the template _id', () => {
      component.editTemplate(mockTemplate);
      expect(component.editingTemplateId()).toBe('tmpl-1');
    });

    it('should patch templateForm with the template values', () => {
      component.editTemplate(mockTemplate);
      expect(component.templateForm.get('name')?.value).toBe(mockTemplate.name);
      expect(component.templateForm.get('title')?.value).toBe(mockTemplate.title);
      expect(component.templateForm.get('body')?.value).toBe(mockTemplate.body);
    });
  });

  // ─── cancelEditTemplate ───────────────────────────────────────────────────

  describe('cancelEditTemplate()', () => {
    it('should reset editingTemplateId to null', () => {
      component.editingTemplateId.set('tmpl-1');
      component.cancelEditTemplate();
      expect(component.editingTemplateId()).toBeNull();
    });

    it('should reset templateForm type to "marketing"', () => {
      component.templateForm.get('name')?.setValue('My Template');
      component.cancelEditTemplate();
      expect(component.templateForm.get('name')?.value).toBeNull();
      expect(component.templateForm.get('type')?.value).toBe('marketing');
    });
  });

  // ─── saveTemplate ─────────────────────────────────────────────────────────

  describe('saveTemplate()', () => {
    function fillTemplateForm() {
      component.templateForm.patchValue({
        name: 'My Template',
        title: 'Title',
        body: 'Body',
        type: 'marketing',
      });
    }

    it('should mark templateForm as touched when invalid', () => {
      component.templateForm.get('name')?.setValue('');
      component.saveTemplate();
      expect(component.templateForm.touched).toBeTrue();
    });

    it('should call createTemplate when no editingTemplateId', () => {
      fillTemplateForm();
      component.editingTemplateId.set(null);
      component.saveTemplate();
      expect(notifServiceMock.createTemplate).toHaveBeenCalled();
    });

    it('should call updateTemplate when editingTemplateId is set', () => {
      fillTemplateForm();
      component.editingTemplateId.set('tmpl-1');
      component.saveTemplate();
      expect(notifServiceMock.updateTemplate).toHaveBeenCalledWith(
        'tmpl-1',
        jasmine.any(Object)
      );
    });

    it('should show "Template created" snackbar after create', () => {
      fillTemplateForm();
      component.editingTemplateId.set(null);
      component.saveTemplate();
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Template created',
        'OK',
        jasmine.any(Object)
      );
    });

    it('should show "Template updated" snackbar after update', () => {
      fillTemplateForm();
      component.editingTemplateId.set('tmpl-1');
      component.saveTemplate();
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Template updated',
        'OK',
        jasmine.any(Object)
      );
    });

    it('should reset editingTemplateId and reload templates after save', () => {
      fillTemplateForm();
      notifServiceMock.getTemplates.calls.reset();
      component.editingTemplateId.set('tmpl-1');
      component.saveTemplate();
      expect(component.editingTemplateId()).toBeNull();
      expect(notifServiceMock.getTemplates).toHaveBeenCalled();
    });

    it('should set savingTemplate to false after save', () => {
      fillTemplateForm();
      component.saveTemplate();
      expect(component.savingTemplate()).toBeFalse();
    });

    it('should show snackbar on save error', () => {
      fillTemplateForm();
      notifServiceMock.createTemplate.and.returnValue(
        throwError(() => ({ message: 'Save error' }))
      );
      component.editingTemplateId.set(null);
      component.saveTemplate();
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Save error',
        'Dismiss',
        jasmine.any(Object)
      );
    });
  });

  // ─── deleteTemplate ───────────────────────────────────────────────────────

  describe('deleteTemplate()', () => {
    it('should NOT call service when user cancels confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteTemplate('tmpl-1');
      expect(notifServiceMock.deleteTemplate).not.toHaveBeenCalled();
    });

    it('should call service when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteTemplate('tmpl-1');
      expect(notifServiceMock.deleteTemplate).toHaveBeenCalledWith('tmpl-1');
    });

    it('should show snackbar and reload templates after deletion', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      notifServiceMock.getTemplates.calls.reset();
      component.deleteTemplate('tmpl-1');
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Template deleted',
        'OK',
        jasmine.any(Object)
      );
      expect(notifServiceMock.getTemplates).toHaveBeenCalled();
    });

    it('should show snackbar on delete error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      notifServiceMock.deleteTemplate.and.returnValue(
        throwError(() => ({ message: 'Delete failed' }))
      );
      component.deleteTemplate('tmpl-1');
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Delete failed',
        'Dismiss',
        jasmine.any(Object)
      );
    });
  });

  // ─── loadLogs ─────────────────────────────────────────────────────────────

  describe('loadLogs()', () => {
    it('should call getAdminLogs with current page and limit', () => {
      notifServiceMock.getAdminLogs.calls.reset();
      component.loadLogs();
      expect(notifServiceMock.getAdminLogs).toHaveBeenCalledWith(
        component.logPage(),
        component.logLimit()
      );
    });

    it('should populate logDataSource with the response data', () => {
      expect(component.logDataSource.data.length).toBe(1);
      expect(component.logDataSource.data[0]._id).toBe('log-1');
    });

    it('should update logTotal signal', () => {
      expect(component.logTotal()).toBe(1);
    });

    it('should set loadingLogs to false after load', () => {
      expect(component.loadingLogs()).toBeFalse();
    });

    it('should show snackbar on error', () => {
      notifServiceMock.getAdminLogs.and.returnValue(
        throwError(() => ({ message: 'Log error' }))
      );
      component.loadLogs();
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Log error',
        'Dismiss',
        jasmine.any(Object)
      );
    });
  });

  // ─── onLogPage ────────────────────────────────────────────────────────────

  describe('onLogPage()', () => {
    it('should update page and limit signals and reload logs', () => {
      notifServiceMock.getAdminLogs.calls.reset();
      const event: PageEvent = { pageIndex: 2, pageSize: 20, length: 50 };
      component.onLogPage(event);
      expect(component.logPage()).toBe(3);
      expect(component.logLimit()).toBe(20);
      expect(notifServiceMock.getAdminLogs).toHaveBeenCalled();
    });
  });

  // ─── Static data ─────────────────────────────────────────────────────────

  describe('static data properties', () => {
    it('should have 24 hour options', () => {
      expect(component.hours.length).toBe(24);
      expect(component.hours[0]).toBe('00');
      expect(component.hours[23]).toBe('23');
    });

    it('should have 12 minute options', () => {
      expect(component.minutes.length).toBe(12);
    });

    it('should contain expected notification types', () => {
      expect(component.notificationTypes).toContain('marketing');
      expect(component.notificationTypes).toContain('activity');
      expect(component.notificationTypes).toContain('chat');
    });
  });
});
