import { ColorService } from './color.service';

describe('ColorService', () => {
  const service = new ColorService();

  describe('hex parsing', () => {
    it('parses 3- and 6-digit hex, with or without #', () => {
      expect(service.parseHex('#abc')).toEqual([170, 187, 204]);
      expect(service.parseHex('FF0000')).toEqual([255, 0, 0]);
    });

    it('rejects invalid input', () => {
      expect(service.parseHex('#12')).toBeNull();
      expect(service.parseHex('#gggggg')).toBeNull();
      expect(service.parseHex('')).toBeNull();
    });

    it('normalizes to lowercase #rrggbb', () => {
      expect(service.normalize('ABC')).toBe('#aabbcc');
    });
  });

  describe('contrast', () => {
    it('gives 21:1 for black on white, in either order', () => {
      expect(service.contrast('#000000', '#ffffff')).toBeCloseTo(21, 1);
      expect(service.contrast('#ffffff', '#000000')).toBeCloseTo(21, 1);
    });

    it('gives 1:1 for identical colours', () => {
      expect(service.contrast('#336699', '#336699')).toBeCloseTo(1, 5);
    });

    it('matches the well-known #767676 / #777777 AA boundary on white', () => {
      expect(service.contrast('#767676', '#ffffff')!).toBeGreaterThanOrEqual(4.5);
      expect(service.contrast('#777777', '#ffffff')!).toBeLessThan(4.5);
    });

    it('returns null for invalid colours', () => {
      expect(service.contrast('nope', '#ffffff')).toBeNull();
    });
  });

  describe('wcag thresholds', () => {
    it('flags each level correctly at 4.5', () => {
      const r = service.wcag(4.5);
      expect(r.aaNormal).toBe(true);
      expect(r.aaLarge).toBe(true);
      expect(r.aaaNormal).toBe(false);
      expect(r.aaaLarge).toBe(true);
    });

    it('fails everything below 3', () => {
      const r = service.wcag(2.99);
      expect(r.aaNormal).toBe(false);
      expect(r.aaLarge).toBe(false);
    });
  });

  describe('simulation', () => {
    it('leaves mid-grey essentially unchanged', () => {
      const out = service.parseHex(service.simulate('#808080', 'protan')!)!;
      out.forEach((c) => expect(Math.abs(c - 128)).toBeLessThanOrEqual(1));
    });

    it('returns the original colour at severity 0', () => {
      expect(service.simulate('#e8590c', 'deutan', 0)).toBe('#e8590c');
    });

    it('makes pure red darker for protanopia', () => {
      const simulated = service.simulate('#ff0000', 'protan')!;
      expect(service.luminance(simulated)!).toBeLessThan(service.luminance('#ff0000')!);
    });
  });

  describe('grayscale', () => {
    it('keeps black and white', () => {
      expect(service.grayscale('#000000')).toBe('#000000');
      expect(service.grayscale('#ffffff')).toBe('#ffffff');
    });

    it('returns equal channels', () => {
      const [r, g, b] = service.parseHex(service.grayscale('#e8590c')!)!;
      expect(r).toBe(g);
      expect(g).toBe(b);
    });
  });
});