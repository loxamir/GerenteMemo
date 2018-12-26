import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedListPage } from './planned-list.page';

describe('PlannedListPage', () => {
  let component: PlannedListPage;
  let fixture: ComponentFixture<PlannedListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlannedListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannedListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
