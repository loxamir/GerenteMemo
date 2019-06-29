import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractListPage } from './contract-list.page';

describe('ContractListPage', () => {
  let component: ContractListPage;
  let fixture: ComponentFixture<ContractListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
