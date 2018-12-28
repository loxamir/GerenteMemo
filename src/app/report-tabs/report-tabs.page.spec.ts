import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTabsPage } from './report-tabs.page';

describe('ReportTabsPage', () => {
  let component: ReportTabsPage;
  let fixture: ComponentFixture<ReportTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportTabsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
