import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityReportPage } from './activity-report.page';

describe('ActivityReportPage', () => {
  let component: ActivityReportPage;
  let fixture: ComponentFixture<ActivityReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
