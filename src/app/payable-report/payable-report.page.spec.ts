import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayableReportPage } from './payable-report.page';

describe('PayableReportPage', () => {
  let component: PayableReportPage;
  let fixture: ComponentFixture<PayableReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayableReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayableReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
