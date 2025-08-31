import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoraAppComponent } from './lora-app.component';

describe('LoraAppComponent', () => {
  let component: LoraAppComponent;
  let fixture: ComponentFixture<LoraAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoraAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoraAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
