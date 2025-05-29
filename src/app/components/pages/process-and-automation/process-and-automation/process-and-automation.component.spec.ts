import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessAndAutomationComponent } from './process-and-automation.component';

describe('ProcessAndAutomationComponent', () => {
  let component: ProcessAndAutomationComponent;
  let fixture: ComponentFixture<ProcessAndAutomationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessAndAutomationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessAndAutomationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
