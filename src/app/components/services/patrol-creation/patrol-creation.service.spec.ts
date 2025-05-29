import { TestBed } from '@angular/core/testing';

import { PatrolCreationService } from './patrol-creation.service';

describe('PatrolCreationService', () => {
  let service: PatrolCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatrolCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
