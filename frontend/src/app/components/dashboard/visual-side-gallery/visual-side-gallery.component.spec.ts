import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualSideGalleryComponent } from './visual-side-gallery.component';

describe('VisualSideGalleryComponent', () => {
  let component: VisualSideGalleryComponent;
  let fixture: ComponentFixture<VisualSideGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualSideGalleryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualSideGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
