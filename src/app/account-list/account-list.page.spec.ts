import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountListPage } from './account-list.page';

describe('AccountListPage', () => {
  let component: AccountListPage;
  let fixture: ComponentFixture<AccountListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
