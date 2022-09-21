import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdgroupComponent } from './create-adgroup.component';

describe('CreateAdgroupComponent', () => {
  let component: CreateAdgroupComponent;
  let fixture: ComponentFixture<CreateAdgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAdgroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAdgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
