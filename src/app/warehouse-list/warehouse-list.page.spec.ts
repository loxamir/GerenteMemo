import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseListPage } from './warehouse-list.page';

describe('WarehouseListPage', () => {
  let component: WarehouseListPage;
  let fixture: ComponentFixture<WarehouseListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
