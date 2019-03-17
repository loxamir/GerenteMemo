import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockReportPage } from './stock-report.page';

describe('StockReportPage', () => {
  let component: StockReportPage;
  let fixture: ComponentFixture<StockReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
