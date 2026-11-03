import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AdminContactComponent } from './admin-contact.component';
import { ContactService } from '@/app/service/contact.service';
import { Contact } from '@/types/contact.type';
import { APIPagination } from '@/types/base.type';
import { ContactDetailsDialogComponent } from './contact-details-dialog/contact-details-dialog.component';

describe('AdminContactComponent', () => {
  let component: AdminContactComponent;
  let fixture: ComponentFixture<AdminContactComponent>;
  let contactServiceSpy: jasmine.SpyObj<ContactService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const contactMock: Contact = {
    _id: 'contact-1',
    email: 'john@example.com',
    name: 'John Doe',
    message: 'Hello from unit test',
    deleted: false,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  } as Contact;

  const contactResponse: APIPagination<Contact> = {
    data: [contactMock],
    count: 1,
  };

  beforeEach(async () => {
    contactServiceSpy = jasmine.createSpyObj<ContactService>('ContactService', [
      'findAll',
      'delete',
    ]);
    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    contactServiceSpy.findAll.and.returnValue(of(contactResponse));
    contactServiceSpy.delete.and.returnValue(of(contactMock));

    await TestBed.configureTestingModule({
      imports: [AdminContactComponent],
      providers: [
        { provide: ContactService, useValue: contactServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    })
      // Keep unit tests focused on component logic.
      .overrideComponent(AdminContactComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(AdminContactComponent);
    component = fixture.componentInstance;

    // Ensure component uses mocked instances even when module-level providers exist.
    (component as any).contactService = contactServiceSpy;
    (component as any).dialog = dialogSpy;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load contacts on init in browser', () => {
    fixture.detectChanges();

    expect(contactServiceSpy.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(component.dataSource.data).toEqual([contactMock]);
    expect(component.totalCount()).toBe(1);
    expect(component.loading()).toBeFalse();
  });

  it('should not load contacts on server platform', () => {
    const loadContactsSpy = spyOn(component, 'loadContacts');
    (component as any).platformId = 'server';

    component.ngOnInit();

    expect(loadContactsSpy).not.toHaveBeenCalled();
  });

  it('should apply filter and update search signal', () => {
    const paginatorSpy = {
      firstPage: jasmine.createSpy('firstPage'),
      page: of({}),
      initialized: of(void 0),
    } as any;
    component.dataSource.paginator = paginatorSpy;

    const event = {
      target: { value: '  John  ' },
    } as unknown as Event;

    component.applyFilter(event);

    expect(component.searchQuery()).toBe('  John  ');
    expect(component.dataSource.filter).toBe('john');
    expect(paginatorSpy.firstPage).toHaveBeenCalled();
  });

  it('should clear search and reset paginator', () => {
    component.searchQuery.set('hello');
    component.dataSource.filter = 'hello';
    const paginatorSpy = {
      firstPage: jasmine.createSpy('firstPage'),
      page: of({}),
      initialized: of(void 0),
    } as any;
    component.dataSource.paginator = paginatorSpy;

    component.clearSearch();

    expect(component.searchQuery()).toBe('');
    expect(component.dataSource.filter).toBe('');
    expect(paginatorSpy.firstPage).toHaveBeenCalled();
  });

  it('should update paging and reload contacts on page change', () => {
    const loadContactsSpy = spyOn(component, 'loadContacts');
    const event: PageEvent = {
      length: 100,
      pageIndex: 2,
      pageSize: 25,
      previousPageIndex: 1,
    };

    component.onPageChange(event);

    expect(component.pageIndex()).toBe(2);
    expect(component.pageSize()).toBe(25);
    expect(loadContactsSpy).toHaveBeenCalled();
  });

  it('should open details dialog with contact data', () => {
    dialogSpy.open.and.returnValue({} as any);

    component.viewContactDetails(contactMock);

    expect(dialogSpy.open).toHaveBeenCalledWith(ContactDetailsDialogComponent, {
      width: '600px',
      data: contactMock,
    });
  });

  it('should delete contact and reload when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const loadContactsSpy = spyOn(component, 'loadContacts');

    component.deleteContact(contactMock);

    expect(contactServiceSpy.delete).toHaveBeenCalledWith('contact-1');
    expect(loadContactsSpy).toHaveBeenCalled();
  });

  it('should not delete contact when confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteContact(contactMock);

    expect(contactServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should truncate long message with ellipsis', () => {
    const result = component.truncateMessage('abcdefghij', 5);

    expect(result).toBe('abcde...');
  });

  it('should sort contacts by name in ascending order', () => {
    const zContact: Contact = {
      ...contactMock,
      _id: 'contact-z',
      name: 'Zara',
    };
    const aContact: Contact = {
      ...contactMock,
      _id: 'contact-a',
      name: 'Alice',
    };

    const sorted = component.dataSource.sortData([zContact, aContact], {
      active: 'name',
      direction: 'asc',
    } as any);

    expect(sorted.map((c) => c.name)).toEqual(['Alice', 'Zara']);
  });
});
