import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTravelPage } from './travel.page';

describe('ServiceTravelPage', () => {
  let component: ServiceTravelPage;
  let fixture: ComponentFixture<ServiceTravelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTravelPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTravelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
