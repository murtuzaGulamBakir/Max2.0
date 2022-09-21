import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayCampaignComponent } from './display-campaign.component';

describe('DisplayCampaignComponent', () => {
  let component: DisplayCampaignComponent;
  let fixture: ComponentFixture<DisplayCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayCampaignComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
