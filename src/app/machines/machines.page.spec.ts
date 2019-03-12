import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachinesPage } from './machines.page';

describe('MachinesPage', () => {
  let component: MachinesPage;
  let fixture: ComponentFixture<MachinesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachinesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachinesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
