import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardListPage } from './dashboard-list.page';

describe('DashboardListPage', () => {
  let component: DashboardListPage;
  let fixture: ComponentFixture<DashboardListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
