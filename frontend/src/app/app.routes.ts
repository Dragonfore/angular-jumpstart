import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },
  {
    path: 'items',
    loadChildren: () =>
      import('./features/items/items.routes').then((m) => m.ITEMS_ROUTES),
  },
];
