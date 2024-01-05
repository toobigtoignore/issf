import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributeProfileComponent } from './contribute-profile.component';

describe('ContributeProfileComponent', () => {
  let component: ContributeProfileComponent;
  let fixture: ComponentFixture<ContributeProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContributeProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
