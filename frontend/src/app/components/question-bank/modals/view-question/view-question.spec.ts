import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuestion } from './view-question';

describe('ViewQuestion', () => {
  let component: ViewQuestion;
  let fixture: ComponentFixture<ViewQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewQuestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
