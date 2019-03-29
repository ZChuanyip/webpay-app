import { TestBed, inject } from '@angular/core/testing';

import { ParkingFeeCalculationService } from './parking-fee-calculation.service';

describe('ParkingFeeCalculationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ParkingFeeCalculationService]
    });
  });

  it('should be created', inject([ParkingFeeCalculationService], (service: ParkingFeeCalculationService) => {
    expect(service).toBeTruthy();
  }));
});
