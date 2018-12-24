import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMoveListPage } from './stock-move-list.page';

describe('StockMoveListPage', () => {
  let component: StockMoveListPage;
  let fixture: ComponentFixture<StockMoveListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockMoveListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockMoveListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
