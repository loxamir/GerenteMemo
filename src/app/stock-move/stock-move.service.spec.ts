import { TestBed } from '@angular/core/testing';

import { StockMoveService } from './stock-move.service';

describe('StockMoveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StockMoveService = TestBed.get(StockMoveService);
    expect(service).toBeTruthy();
  });
});
