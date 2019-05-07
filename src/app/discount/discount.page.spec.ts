import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountPage } from './discount.page';

describe('DiscountPage', () => {
  let component: DiscountPage;
  let fixture: ComponentFixture<DiscountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
