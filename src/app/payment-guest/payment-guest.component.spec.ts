import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGuestComponent } from './payment-guest.component';

describe('PaymentGuestComponent', () => {
  let component: PaymentGuestComponent;
  let fixture: ComponentFixture<PaymentGuestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentGuestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
