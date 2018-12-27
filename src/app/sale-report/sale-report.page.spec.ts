import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleReportPage } from './sale-report.page';

describe('SaleReportPage', () => {
  let component: SaleReportPage;
  let fixture: ComponentFixture<SaleReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
