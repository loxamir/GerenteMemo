import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropPage } from './crop.page';

describe('CropPage', () => {
  let component: CropPage;
  let fixture: ComponentFixture<CropPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
