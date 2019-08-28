import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureContractPage } from './/future-contract.page';

describe('FutureContractPage', () => {
  let component: FutureContractPage;
  let fixture: ComponentFixture<FutureContractPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FutureContractPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureContractPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
