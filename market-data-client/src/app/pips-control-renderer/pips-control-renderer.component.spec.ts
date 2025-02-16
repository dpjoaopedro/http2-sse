import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipsControlRendererComponent } from './pips-control-renderer.component';

describe('PipsControlRendererComponent', () => {
  let component: PipsControlRendererComponent;
  let fixture: ComponentFixture<PipsControlRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipsControlRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipsControlRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
