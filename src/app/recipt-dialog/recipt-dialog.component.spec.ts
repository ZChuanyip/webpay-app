import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReciptDialogComponent } from './recipt-dialog.component';

describe('ReciptDialogComponent', () => {
  let component: ReciptDialogComponent;
  let fixture: ComponentFixture<ReciptDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReciptDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReciptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
