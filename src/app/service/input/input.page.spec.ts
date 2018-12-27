import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceInputPage } from './input.page';

describe('ServiceInputPage', () => {
  let component: ServiceInputPage;
  let fixture: ComponentFixture<ServiceInputPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceInputPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceInputPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
