import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceReportPage } from './balance-report.page';

describe('BalanceReportPage', () => {
  let component: BalanceReportPage;
  let fixture: ComponentFixture<BalanceReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BalanceReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
