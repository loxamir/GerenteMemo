import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessListPage } from './process-list.page';

describe('ProcessListPage', () => {
  let component: ProcessListPage;
  let fixture: ComponentFixture<ProcessListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
