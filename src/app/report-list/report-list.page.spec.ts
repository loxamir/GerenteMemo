import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportListPage } from './report-list.page';

describe('ReportListPage', () => {
  let component: ReportListPage;
  let fixture: ComponentFixture<ReportListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
