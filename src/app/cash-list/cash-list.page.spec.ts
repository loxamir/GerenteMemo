import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashListPage } from './cash-list.page';

describe('CashListPage', () => {
  let component: CashListPage;
  let fixture: ComponentFixture<CashListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
