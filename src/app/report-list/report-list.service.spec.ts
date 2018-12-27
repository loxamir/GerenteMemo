import { TestBed } from '@angular/core/testing';

import { ReportListService } from './report-list.service';

describe('ReportListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReportListService = TestBed.get(ReportListService);
    expect(service).toBeTruthy();
  });
});
