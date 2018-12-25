import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleListPage } from './title-list.page';

describe('TitleListPage', () => {
  let component: TitleListPage;
  let fixture: ComponentFixture<TitleListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TitleListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
