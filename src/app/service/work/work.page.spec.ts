import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceWorkPage } from './work.page';

describe('ServiceWorkPage', () => {
  let component: ServiceWorkPage;
  let fixture: ComponentFixture<ServiceWorkPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceWorkPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceWorkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
