# Colour-blind Palette Checker

A small web app I built with Angular and TypeScript to learn Angular. You pick two colours and it tells you if the text is readable (WCAG contrast), and it shows how the colours look to people with colour blindness.

**Live demo:** https://vbockaj.github.io/colour-contrast-checker/

## Why I made it

My Master's thesis was about web accessibility for colour-blind users. I checked Croatian university websites with WAVE and Coblis. Those tools tell you what is wrong, but I wanted something where you can try colours and see the result straight away. This was also a good way to practise Angular on a topic I already know.

## What it does

- **Contrast checker:** type a text colour and a background colour (hex code or colour picker). It shows the contrast ratio and whether it passes WCAG AA and AAA, for normal and large text.
- **Colour-blindness simulation:** shows your colours next to each other as seen with normal vision, protanopia, deuteranopia and tritanopia. There is a slider for how strong the effect is.
- **Live preview:** a sample text block in your colours, so you can see how it really looks.
- **Palette page:** add several colours and see the contrast ratio for every pair in a table.
- **About page:** a short explanation of how it works.

## What I used

- Angular (standalone components and routing)
- TypeScript
- Reactive forms, with a check that the hex code is valid
- One `ColorService` that does all the colour maths. I kept it separate from the components so it was easy to test.

## How the maths works

I didn't want to just copy a formula, so here is what I understood:

- **Contrast ratio:** each colour is turned into a "relative luminance" number (how bright it is for the human eye). Then the ratio is `(lighter + 0.05) / (darker + 0.05)`. For AA, normal text needs at least 4.5:1 and large text 3:1. For AAA it is 7:1 and 4.5:1.
- **Colour-blindness simulation:** for each type I multiply the colour by a 3x3 matrix from a research paper (Machado, Oliveira and Fernandes, 2009). The results can look a bit different from Coblis because tools use slightly different models.

## Testing accessibility

Since the app is about accessibility, I wanted to test it too.

| What I tested | What I found | What I changed |
| --- | --- | --- |
| WAVE | [ADD YOUR WAVE RESULT] | [ADD WHAT YOU CHANGED] |
| Keyboard only | I went through all three pages with just the keyboard. The skip link works, I can reach every control, I can always see where the focus is, the slider works with the arrow keys, and Add/Remove work with Enter and Space. | Nothing |
| Zoom 200% and 400% | Nothing gets cut off or overlaps. At 400% the page does not scroll sideways. Only the palette table scrolls sideways on its own, which is allowed for tables. | Nothing |

I have **not** tested with a screen reader (NVDA) yet. That is on my list.

Other things I tried to do: every input has a label, the focus outline is clearly visible, and pass/fail is shown with text and not only with colour.

## Run it on your computer

```bash
git clone [ADD REPO URL]
cd colour-checker
npm install
ng serve
```

Then open http://localhost:4200.

## Run the tests

```bash
ng test
```

The tests check hex parsing, luminance, contrast ratios (for example `#777` on white should be about 4.48, which is a known value) and the colour-blindness simulation.

## Project structure

```
src/app/
  services/color.service.ts   # all the colour maths
  ...                         # checker, palette and about pages
```

## What I want to add later

- A "suggest a better colour" button that changes a failing colour until it passes AA
- Sharing your result as a link with the colours in the URL
- Testing with NVDA
