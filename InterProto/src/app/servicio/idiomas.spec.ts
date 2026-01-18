import { TestBed } from '@angular/core/testing';

import { Idiomas } from '../idiomas';

describe('Idiomas', () => {
  let service: Idiomas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Idiomas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
