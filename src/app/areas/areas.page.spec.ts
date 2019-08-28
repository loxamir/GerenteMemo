import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasPage } from './areas.page';

describe('AreasPage', () => {
  let component: AreasPage;
  let fixture: ComponentFixture<AreasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
