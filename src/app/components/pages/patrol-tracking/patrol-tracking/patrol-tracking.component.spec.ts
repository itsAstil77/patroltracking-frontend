import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatrolTrackingComponent } from './patrol-tracking.component';

describe('PatrolTrackingComponent', () => {
  let component: PatrolTrackingComponent;
  let fixture: ComponentFixture<PatrolTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatrolTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatrolTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
