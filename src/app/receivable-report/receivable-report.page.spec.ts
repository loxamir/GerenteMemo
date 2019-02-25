import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivableReportPage } from './receivable-report.page';

describe('ReceivableReportPage', () => {
  let component: ReceivableReportPage;
  let fixture: ComponentFixture<ReceivableReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivableReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivableReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
