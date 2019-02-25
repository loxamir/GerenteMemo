import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceReportPage } from './service-report.page';

describe('ServiceReportPage', () => {
  let component: ServiceReportPage;
  let fixture: ComponentFixture<ServiceReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
