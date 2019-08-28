import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgroTabsPage } from './agro-tabs.page';

describe('AgroTabsPage', () => {
  let component: AgroTabsPage;
  let fixture: ComponentFixture<AgroTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgroTabsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgroTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
