import { Routes } from '@angular/router';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemFormComponent } from './item-form/item-form.component';

export const ITEMS_ROUTES: Routes = [
  { path: '', component: ItemListComponent },
  { path: 'new', component: ItemFormComponent },
  { path: ':id/edit', component: ItemFormComponent },
];
