import { TestBed } from '@angular/core/testing';

import { ProcessListService } from './process-list.service';

describe('ProcessListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProcessListService = TestBed.get(ProcessListService);
    expect(service).toBeTruthy();
  });
});
