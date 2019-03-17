import { TestBed } from '@angular/core/testing';

import { CloseService } from './close.service';

describe('CloseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CloseService = TestBed.get(CloseService);
    expect(service).toBeTruthy();
  });
});
