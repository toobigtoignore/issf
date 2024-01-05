import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributeCaseComponent } from './contribute-case.component';

describe('ContributeCaseComponent', () => {
  let component: ContributeCaseComponent;
  let fixture: ComponentFixture<ContributeCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContributeCaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributeCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
