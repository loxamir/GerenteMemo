import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReportPage } from './purchase-report.page';

describe('PurchaseReportPage', () => {
  let component: PurchaseReportPage;
  let fixture: ComponentFixture<PurchaseReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
