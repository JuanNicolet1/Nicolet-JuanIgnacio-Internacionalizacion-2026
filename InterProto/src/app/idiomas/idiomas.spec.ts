import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Idiomas } from './idiomas';

describe('Idiomas', () => {
  let component: Idiomas;
  let fixture: ComponentFixture<Idiomas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Idiomas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Idiomas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
