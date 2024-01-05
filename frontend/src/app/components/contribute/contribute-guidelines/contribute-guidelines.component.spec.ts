import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributeGuidelinesComponent } from './contribute-guidelines.component';

describe('ContributeGuidelinesComponent', () => {
  let component: ContributeGuidelinesComponent;
  let fixture: ComponentFixture<ContributeGuidelinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContributeGuidelinesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributeGuidelinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
