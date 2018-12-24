import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashMovePage } from './cash-move.page';

describe('CashMovePage', () => {
  let component: CashMovePage;
  let fixture: ComponentFixture<CashMovePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashMovePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashMovePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
