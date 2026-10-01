import { Routes } from '@angular/router';
import { Checker } from './pages/checker/checker';
import { Palette } from './pages/palette/palette';
import { About } from './pages/about/about';

export const routes: Routes = [
  { path: '', component: Checker, title: 'Contrast checker' },
  { path: 'palette', component: Palette, title: 'Palette matrix' },
  { path: 'about', component: About, title: 'About' },
  { path: '**', redirectTo: '' },
];