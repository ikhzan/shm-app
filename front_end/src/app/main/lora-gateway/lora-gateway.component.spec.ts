import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoraGatewayComponent } from './lora-gateway.component';

describe('LoraGatewayComponent', () => {
  let component: LoraGatewayComponent;
  let fixture: ComponentFixture<LoraGatewayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoraGatewayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoraGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
