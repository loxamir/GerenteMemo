import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImporterPage } from './importer.page';

describe('ImporterPage', () => {
  let component: ImporterPage;
  let fixture: ComponentFixture<ImporterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImporterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImporterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
