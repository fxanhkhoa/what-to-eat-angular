import {
  Component,
  inject,
  OnInit,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PushNotificationService } from '@/app/service/push-notification.service';
import type {
  AdminNotificationLog,
  NotificationTemplate,
} from '@/types/notification.type';
import { finalize } from 'rxjs';
import { c } from "../../../../../node_modules/@angular/cdk/a11y-module.d-DBHGyKoh";

@Component({
  selector: 'app-admin-notification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
],
  templateUrl: './admin-notification.component.html',
  styleUrl: './admin-notification.component.scss',
})
export class AdminNotificationComponent implements OnInit {
  private notifService = inject(PushNotificationService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);

  // ---- Compose tab ----
  composeForm!: FormGroup;
  sendTarget: 'all' | 'segment' = 'all';
  sending = signal(false);
  templates = signal<NotificationTemplate[]>([]);

  notificationTypes = ['marketing', 'activity', 'chat'];
  hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  // ---- Templates tab ----
  templateForm!: FormGroup;
  editingTemplateId = signal<string | null>(null);
  savingTemplate = signal(false);
  loadingTemplates = signal(false);
  templateDataSource = new MatTableDataSource<NotificationTemplate>([]);
  templateColumns = ['name', 'type', 'title', 'createdAt', 'actions'];
  templateTotal = signal(0);
  templatePage = signal(1);
  templateLimit = signal(10);

  // ---- History tab ----
  loadingLogs = signal(false);
  logDataSource = new MatTableDataSource<AdminNotificationLog>([]);
  logColumns = ['sentTo', 'type', 'title', 'totalSent', 'totalFailed', 'sentAt', 'scheduledAt'];
  logTotal = signal(0);
  logPage = signal(1);
  logLimit = signal(10);

  ngOnInit(): void {
    this.initForms();
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadTemplates();
    this.loadLogs();
  }

  private initForms(): void {
    this.composeForm = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      imageUrl: [''],
      type: ['marketing', Validators.required],
      scheduledAt: [null],
      scheduledHour: ['00'],
      scheduledMinute: ['00'],
      // segment fields
      roleNames: [''],
      inactiveDays: [null],
    });

    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      title: ['', Validators.required],
      body: ['', Validators.required],
      imageUrl: [''],
      type: ['marketing', Validators.required],
    });
  }

  private extractErrorMessage(err: any, fallback = 'Operation failed'): string {
    return (
      err?.error?.message ??
      err?.error?.error ??
      err?.message ??
      fallback
    );
  }

  // ---- Compose actions ----

  setSendTarget(target: 'all' | 'segment'): void {
    this.sendTarget = target;
  }

  loadFromTemplate(tmpl: NotificationTemplate): void {
    this.composeForm.patchValue({
      title: tmpl.title,
      body: tmpl.body,
      imageUrl: tmpl.imageUrl ?? '',
      type: tmpl.type,
    });
    this.snackBar.open(`Loaded template "${tmpl.name}"`, 'OK', { duration: 2000 });
  }

  send(): void {
    if (this.composeForm.invalid) {
      this.composeForm.markAllAsTouched();
      return;
    }
    const v = this.composeForm.value;
    let scheduledAt: string | undefined;
    if (v.scheduledAt) {
      const date = new Date(v.scheduledAt);
      date.setHours(Number(v.scheduledHour ?? 0), Number(v.scheduledMinute ?? 0), 0, 0);
      scheduledAt = date.toISOString();
    }
    this.sending.set(true);

    const base = {
      title: v.title,
      body: v.body,
      imageUrl: v.imageUrl || undefined,
      type: v.type,
      scheduledAt,
    };

    const obs =
      this.sendTarget === 'all'
        ? this.notifService.sendBroadcast(base)
        : this.notifService.sendSegment({
            ...base,
            segmentFilter: {
              roleNames: v.roleNames
                ? v.roleNames.split(',').map((r: string) => r.trim()).filter(Boolean)
                : undefined,
              inactiveDays: v.inactiveDays ? +v.inactiveDays : undefined,
            },
          });

    obs.pipe(finalize(() => this.sending.set(false))).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'OK', { duration: 3000 });
        this.composeForm.reset({ type: 'marketing', scheduledAt: null, scheduledHour: '00', scheduledMinute: '00' });
        this.loadLogs();
      },
      error: (err) =>
        this.snackBar.open(this.extractErrorMessage(err, 'Send failed'), 'Dismiss', { duration: 4000 }),
    });
  }

  // ---- Template actions ----

  loadTemplates(): void {
    this.loadingTemplates.set(true);
    this.notifService
      .getTemplates(this.templatePage(), this.templateLimit())
      .pipe(finalize(() => this.loadingTemplates.set(false)))
      .subscribe({
        next: (res) => {
          this.templateDataSource.data = res.data;
          this.templateTotal.set(res.count);
          this.templates.set(res.data);
        },
        error: (err) => {
          console.error('[AdminNotification] Failed to load templates', err);
          this.snackBar.open(
            this.extractErrorMessage(err, 'Failed to load templates'),
            'Dismiss',
            { duration: 4000 },
          );
        },
      });
  }

  onTemplatePage(e: PageEvent): void {
    this.templatePage.set(e.pageIndex + 1);
    this.templateLimit.set(e.pageSize);
    this.loadTemplates();
  }

  editTemplate(tmpl: NotificationTemplate): void {
    this.editingTemplateId.set(tmpl._id);
    this.templateForm.patchValue({
      name: tmpl.name,
      title: tmpl.title,
      body: tmpl.body,
      imageUrl: tmpl.imageUrl ?? '',
      type: tmpl.type,
    });
  }

  cancelEditTemplate(): void {
    this.editingTemplateId.set(null);
    this.templateForm.reset({ type: 'marketing' });
  }

  saveTemplate(): void {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }
    const v = this.templateForm.value;
    const dto = { ...v, imageUrl: v.imageUrl || undefined };
    this.savingTemplate.set(true);

    const editId = this.editingTemplateId();
    const obs = editId
      ? this.notifService.updateTemplate(editId, dto)
      : this.notifService.createTemplate(dto);

    obs.pipe(finalize(() => this.savingTemplate.set(false))).subscribe({
      next: () => {
        this.snackBar.open(editId ? 'Template updated' : 'Template created', 'OK', { duration: 2000 });
        this.editingTemplateId.set(null);
        this.templateForm.reset({ type: 'marketing' });
        this.loadTemplates();
      },
      error: (err) =>
        this.snackBar.open(this.extractErrorMessage(err, 'Save failed'), 'Dismiss', { duration: 4000 }),
    });
  }

  deleteTemplate(id: string): void {
    if (!confirm('Delete this template?')) return;
    this.notifService.deleteTemplate(id).subscribe({
      next: () => {
        this.snackBar.open('Template deleted', 'OK', { duration: 2000 });
        this.loadTemplates();
      },
      error: (err) =>
        this.snackBar.open(this.extractErrorMessage(err, 'Delete failed'), 'Dismiss', { duration: 4000 }),
    });
  }

  // ---- History actions ----

  loadLogs(): void {
    this.loadingLogs.set(true);
    this.notifService
      .getAdminLogs(this.logPage(), this.logLimit())
      .pipe(finalize(() => this.loadingLogs.set(false)))
      .subscribe({
        next: (res) => {
          this.logDataSource.data = res.data;
          this.logTotal.set(res.count);
        },
        error: (err) => {
          console.error('[AdminNotification] Failed to load admin logs', err);
          this.snackBar.open(
            this.extractErrorMessage(err, 'Failed to load admin logs'),
            'Dismiss',
            { duration: 4000 },
          );
        },
      });
  }

  onLogPage(e: PageEvent): void {
    this.logPage.set(e.pageIndex + 1);
    this.logLimit.set(e.pageSize);
    this.loadLogs();
  }
}
