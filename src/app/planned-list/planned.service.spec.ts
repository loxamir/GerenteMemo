import { TestBed } from '@angular/core/testing';

import { PlannedService } from './planned.service';

describe('PlannedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlannedService = TestBed.get(PlannedService);
    expect(service).toBeTruthy();
  });
});
