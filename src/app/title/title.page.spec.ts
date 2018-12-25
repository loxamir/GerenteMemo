import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitlePage } from './title.page';

describe('TitlePage', () => {
  let component: TitlePage;
  let fixture: ComponentFixture<TitlePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TitlePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitlePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
