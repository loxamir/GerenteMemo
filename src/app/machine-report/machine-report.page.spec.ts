import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineReportPage } from './machine-report.page';

describe('MachineReportPage', () => {
  let component: MachineReportPage;
  let fixture: ComponentFixture<MachineReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
