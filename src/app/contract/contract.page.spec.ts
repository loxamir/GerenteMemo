import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractPage } from './contract.page';

describe('ContractPage', () => {
  let component: ContractPage;
  let fixture: ComponentFixture<ContractPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
