import { Injectable } from '@angular/core';

/** [red, green, blue], each 0-255 */
export type Rgb = [number, number, number];

/** The three kinds of dichromacy */
export type CvdType = 'protan' | 'deutan' | 'tritan';

const MATRICES: Record<CvdType, number[][]> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

@Injectable({ providedIn: 'root' })
export class ColorService {
  // ---------- hex <-> rgb ----------

  /** Accepts "#abc", "abc", "#aabbcc", "aabbcc". Returns null if invalid. */
  parseHex(input: string): Rgb | null {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
    if (!match) return null;
    let hex = match[1];
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
  }

  toHex(rgb: Rgb): string {
    return '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('');
  }

  /** "ABC" -> "#aabbcc"; null if invalid */
  normalize(input: string): string | null {
    const rgb = this.parseHex(input);
    return rgb ? this.toHex(rgb) : null;
  }

  /** sRGB channel (0-255) -> linear light (0-1) */
  private toLinear(channel: number): number {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  /** linear light (0-1) -> sRGB channel (0-255), clamped */
  private toSrgb(linear: number): number {
    const l = Math.min(1, Math.max(0, linear));
    const v = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
    return Math.round(v * 255);
  }

  // ---------- WCAG contrast ----------

  /** WCAG relative luminance, 0 (black) to 1 (white) */
  luminance(hex: string): number | null {
    const rgb = this.parseHex(hex);
    if (!rgb) return null;
    const [r, g, b] = rgb.map((c) => this.toLinear(c));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /** Contrast ratio from 1 to 21 */
  contrast(a: string, b: string): number | null {
    const la = this.luminance(a);
    const lb = this.luminance(b);
    if (la === null || lb === null) return null;
    const lighter = Math.max(la, lb);
    const darker = Math.min(la, lb);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /** WCAG thresholds: AA 4.5 / 3, AAA 7 / 4.5 (normal / large text) */
  wcag(ratio: number) {
    return {
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }

  // ---------- colour-vision simulation ----------

  /**
   * Simulates a colour-vision deficiency.
   * severity 0 = normal vision, 1 = full dichromacy.
   * Blending towards the full matrix is an approximation of the
   * anomalous forms (protanomaly etc.), not an exact model.
   */
  simulate(hex: string, type: CvdType, severity = 1): string | null {
    const rgb = this.parseHex(hex);
    if (!rgb) return null;
    const lin = rgb.map((c) => this.toLinear(c));
    const out = MATRICES[type].map((row, i) => {
      const mixed = row.map((v, j) => (i === j ? 1 - severity + severity * v : severity * v));
      return mixed[0] * lin[0] + mixed[1] * lin[1] + mixed[2] * lin[2];
    });
    return this.toHex(out.map((l) => this.toSrgb(l)) as Rgb);
  }

  /** Greyscale by WCAG luminance (what monochromacy leaves you with) */
  grayscale(hex: string): string | null {
    const y = this.luminance(hex);
    if (y === null) return null;
    const v = this.toSrgb(y);
    return this.toHex([v, v, v]);
  }
}