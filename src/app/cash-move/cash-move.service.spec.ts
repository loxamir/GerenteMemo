import { TestBed } from '@angular/core/testing';

import { CashMoveService } from './cash-move.service';

describe('CashMoveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CashMoveService = TestBed.get(CashMoveService);
    expect(service).toBeTruthy();
  });
});
