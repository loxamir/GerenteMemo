import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionReportPage } from './production-report.page';

describe('ProductionReportPage', () => {
  let component: ProductionReportPage;
  let fixture: ComponentFixture<ProductionReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductionReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
