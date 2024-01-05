import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributeSotaComponent } from './contribute-sota.component';

describe('ContributeSotaComponent', () => {
  let component: ContributeSotaComponent;
  let fixture: ComponentFixture<ContributeSotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContributeSotaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributeSotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
