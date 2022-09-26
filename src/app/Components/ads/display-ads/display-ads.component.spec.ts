import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayAdsComponent } from './display-ads.component';

describe('DisplayAdsComponent', () => {
  let component: DisplayAdsComponent;
  let fixture: ComponentFixture<DisplayAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayAdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
