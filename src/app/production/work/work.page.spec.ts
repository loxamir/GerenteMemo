import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionWorkPage } from './work.page';

describe('ProductionWorkPage', () => {
  let component: ProductionWorkPage;
  let fixture: ComponentFixture<ProductionWorkPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductionWorkPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionWorkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
