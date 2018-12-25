import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckListPage } from './check-list.page';

describe('CheckListPage', () => {
  let component: CheckListPage;
  let fixture: ComponentFixture<CheckListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
