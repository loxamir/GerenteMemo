import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachinePage } from './machine.page';

describe('MachinePage', () => {
  let component: MachinePage;
  let fixture: ComponentFixture<MachinePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachinePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
