import { TestBed } from '@angular/core/testing';

import { FutureContractService } from './future-contract.service';

describe('FutureContractService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FutureContractService = TestBed.get(FutureContractService);
    expect(service).toBeTruthy();
  });
});
