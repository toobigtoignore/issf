import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualGalleryComponent } from './visual-gallery.component';

describe('VisualGalleryComponent', () => {
  let component: VisualGalleryComponent;
  let fixture: ComponentFixture<VisualGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualGalleryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
