import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentConditionPage } from './payment-condition.page';

describe('PaymentConditionPage', () => {
  let component: PaymentConditionPage;
  let fixture: ComponentFixture<PaymentConditionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentConditionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentConditionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
