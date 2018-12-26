import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePage } from './advance.page';

describe('AdvancePage', () => {
  let component: AdvancePage;
  let fixture: ComponentFixture<AdvancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
