import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksPage } from './works.page';

describe('WorksPage', () => {
  let component: WorksPage;
  let fixture: ComponentFixture<WorksPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorksPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
