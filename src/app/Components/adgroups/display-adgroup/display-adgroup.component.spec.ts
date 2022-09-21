import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayAdgroupComponent } from './display-adgroup.component';

describe('DisplayAdgroupComponent', () => {
  let component: DisplayAdgroupComponent;
  let fixture: ComponentFixture<DisplayAdgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayAdgroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayAdgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
