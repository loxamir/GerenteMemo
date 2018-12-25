import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleListPage } from './sale-list.page';

describe('SaleListPage', () => {
  let component: SaleListPage;
  let fixture: ComponentFixture<SaleListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
