import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitysPage } from './activitys.page';

describe('ActivitysPage', () => {
  let component: ActivitysPage;
  let fixture: ComponentFixture<ActivitysPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitysPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitysPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
