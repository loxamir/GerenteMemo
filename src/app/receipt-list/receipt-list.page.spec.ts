import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptListPage } from './receipt-list.page';

describe('ReceiptListPage', () => {
  let component: ReceiptListPage;
  let fixture: ComponentFixture<ReceiptListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiptListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
