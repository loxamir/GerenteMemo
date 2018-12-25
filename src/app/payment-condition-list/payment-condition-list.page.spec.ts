import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentConditionListPage } from './payment-condition-list.page';

describe('PaymentConditionListPage', () => {
  let component: PaymentConditionListPage;
  let fixture: ComponentFixture<PaymentConditionListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentConditionListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentConditionListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
