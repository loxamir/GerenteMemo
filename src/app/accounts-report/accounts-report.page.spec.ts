import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsReportPage } from './accounts-report.page';

describe('AccountsReportPage', () => {
  let component: AccountsReportPage;
  let fixture: ComponentFixture<AccountsReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
