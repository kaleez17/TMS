import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyQuestion } from './modify-question';

describe('ModifyQuestion', () => {
  let component: ModifyQuestion;
  let fixture: ComponentFixture<ModifyQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyQuestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
