import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';
import { Item } from '../../../models/item.interface';

@Component({
  selector: 'app-item-list',
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss',
})
export class ItemListComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly items = signal<Item[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.apiService.getItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  navigateToNew(): void {
    this.router.navigate(['/items/new']);
  }

  editItem(item: Item): void {
    this.router.navigate(['/items', item.id, 'edit']);
  }

  deleteItem(item: Item): void {
    this.apiService.deleteItem(item.id).subscribe({
      next: () => {
        this.snackBar.open('Item deleted', 'Dismiss', { duration: 3000 });
        this.loadItems();
      },
      error: () => {},
    });
  }
}
