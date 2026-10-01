import { Component, computed, inject, signal } from '@angular/core';
import { ColorService, CvdType } from '../../core/color.service';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.html',
  styleUrl: './palette.css',
})
export class Palette {
  private colors = inject(ColorService);

  readonly min = 3;
  readonly max = 6;

  list = signal<string[]>(['#1a1a1a', '#ffffff', '#d95f02', '#1b9e77']);

  update(i: number, value: string) {
    this.list.update((l) => l.map((c, idx) => (idx === i ? value : c)));
  }
  add() {
    if (this.list().length < this.max) this.list.update((l) => [...l, '#888888']);
  }
  remove(i: number) {
    if (this.list().length > this.min) this.list.update((l) => l.filter((_, idx) => idx !== i));
  }

  /** valid, normalized colour for the swatch, or null */
  swatch(value: string): string | null {
    return this.colors.normalize(value);
  }

  matrix = computed(() => {
    const items = this.list().map((h) => this.colors.normalize(h));
    const types: CvdType[] = ['protan', 'deutan', 'tritan'];

    return items.map((a, i) =>
      items.map((b, j) => {
        if (!a || !b || i === j) return null;

        const normal = this.colors.contrast(a, b)!;
        const sims = types.map(
          (t) => this.colors.contrast(this.colors.simulate(a, t)!, this.colors.simulate(b, t)!)!,
        );
        sims.push(this.colors.contrast(this.colors.grayscale(a)!, this.colors.grayscale(b)!)!);
        const worst = Math.min(...sims);

        return {
          normal: (Math.floor(normal * 100) / 100).toFixed(2),
          worst: (Math.floor(worst * 100) / 100).toFixed(2),
          merges: normal >= 3 && worst < 3,
        };
      }),
    );
  });
}