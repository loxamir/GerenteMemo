import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropsPage } from './crops.page';

describe('CropsPage', () => {
  let component: CropsPage;
  let fixture: ComponentFixture<CropsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
