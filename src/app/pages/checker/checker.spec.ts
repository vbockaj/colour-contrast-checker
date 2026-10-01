import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker } from './checker';

describe('Checker', () => {
  let component: Checker;
  let fixture: ComponentFixture<Checker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checker],
    }).compileComponents();

    fixture = TestBed.createComponent(Checker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
