import { TestBed } from '@angular/core/testing';

import { DashboardListService } from './dashboard-list.service';

describe('DashboardListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardListService = TestBed.get(DashboardListService);
    expect(service).toBeTruthy();
  });
});
