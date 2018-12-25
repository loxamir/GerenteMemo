import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashMoveListPage } from './cash-move-list.page';

describe('CashMoveListPage', () => {
  let component: CashMoveListPage;
  let fixture: ComponentFixture<CashMoveListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashMoveListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashMoveListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
