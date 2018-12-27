import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultReportPage } from './result-report.page';

describe('ResultReportPage', () => {
  let component: ResultReportPage;
  let fixture: ComponentFixture<ResultReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
