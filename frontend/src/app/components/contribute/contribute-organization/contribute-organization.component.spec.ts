import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributeOrganizationComponent } from './contribute-organization.component';

describe('ContributeOrganizationComponent', () => {
  let component: ContributeOrganizationComponent;
  let fixture: ComponentFixture<ContributeOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContributeOrganizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributeOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
