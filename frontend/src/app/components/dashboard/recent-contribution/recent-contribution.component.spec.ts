import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentContributionComponent } from './recent-contribution.component';

describe('RecentContributionComponent', () => {
  let component: RecentContributionComponent;
  let fixture: ComponentFixture<RecentContributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentContributionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
