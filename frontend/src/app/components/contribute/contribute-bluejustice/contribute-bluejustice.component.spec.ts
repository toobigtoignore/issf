import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributeBluejusticeComponent } from './contribute-bluejustice.component';

describe('ContributeBluejusticeComponent', () => {
  let component: ContributeBluejusticeComponent;
  let fixture: ComponentFixture<ContributeBluejusticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContributeBluejusticeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributeBluejusticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
