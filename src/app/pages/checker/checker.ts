import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ColorService } from '../../core/color.service';

const HEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

@Component({
  selector: 'app-checker',
  imports: [ReactiveFormsModule],
  templateUrl: './checker.html',
  styleUrl: './checker.css',
})
export class Checker {
  private colors = inject(ColorService);
  form = new FormGroup({
    fg: new FormControl('#1a1a1a', { nonNullable: true, validators: [Validators.required, Validators.pattern(HEX)] }),
    bg: new FormControl('#ffffff', { nonNullable: true, validators: [Validators.required, Validators.pattern(HEX)] }),
  });

  private value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  fg = computed(() => this.colors.normalize(this.value().fg ?? ''));
  bg = computed(() => this.colors.normalize(this.value().bg ?? ''));
  ratio = computed(() => {
    const f = this.fg(), b = this.bg();
    return f && b ? this.colors.contrast(f, b) : null;
  });

  ratioText = computed(() => {
    const r = this.ratio();
    return r === null ? '' : (Math.floor(r * 100) / 100).toFixed(2);
  });
  results = computed(() => {
    const r = this.ratio();
    return r === null ? null : this.colors.wcag(r);
  });

  showError(name: 'fg' | 'bg'): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  setFromPicker(ctrl: 'fg' | 'bg', value: string) {
    this.form.controls[ctrl].setValue(value);
  }
  severity = signal(1);
  setSeverity(v: string) { this.severity.set(+v); }

  views = computed(() => {
    const f = this.fg(), b = this.bg(), s = this.severity();
    if (!f || !b) return [];
    const make = (label: string, fn: (h: string) => string | null) => {
      const ff = fn(f)!, bb = fn(b)!;
      const ratio = this.colors.contrast(ff, bb)!;
      return { label, fg: ff, bg: bb, ratio: (Math.floor(ratio * 100) / 100).toFixed(2), passAA: ratio >= 4.5 };
    };
    return [
      make('Normal vision', h => h),
      make('Protanopia', h => this.colors.simulate(h, 'protan', s)),
      make('Deuteranopia', h => this.colors.simulate(h, 'deutan', s)),
      make('Tritanopia', h => this.colors.simulate(h, 'tritan', s)),
      make('Greyscale', h => this.colors.grayscale(h)),
    ];
  });
}