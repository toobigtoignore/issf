import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributeGovernanceComponent } from './contribute-governance.component';

describe('ContributeGovernanceComponent', () => {
  let component: ContributeGovernanceComponent;
  let fixture: ComponentFixture<ContributeGovernanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContributeGovernanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributeGovernanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
