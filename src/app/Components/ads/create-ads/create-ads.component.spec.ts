import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdsComponent } from './create-ads.component';

describe('CreateAdsComponent', () => {
  let component: CreateAdsComponent;
  let fixture: ComponentFixture<CreateAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
