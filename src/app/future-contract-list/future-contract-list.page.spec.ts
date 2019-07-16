import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureContractListPage } from './future-contract-list.page';

describe('FutureContractListPage', () => {
  let component: FutureContractListPage;
  let fixture: ComponentFixture<FutureContractListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FutureContractListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureContractListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
