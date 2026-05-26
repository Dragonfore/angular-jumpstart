import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-item-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
})
export class ItemFormComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly submitting = signal(false);
  private editId: string | null = null;

  readonly form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.isEditMode.set(true);
      this.apiService.getItem(this.editId).subscribe({
        next: (item) => {
          this.form.patchValue({
            title: item.title,
            description: item.description ?? '',
          });
        },
        error: () => {
          this.snackBar.open('Failed to load item', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/items']);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const { title, description } = this.form.value;

    const request$ = this.isEditMode()
      ? this.apiService.updateItem(this.editId!, {
          title: title ?? undefined,
          description: description ?? undefined,
        })
      : this.apiService.createItem({
          title: title!,
          description: description ?? undefined,
        });

    request$.subscribe({
      next: () => {
        const msg = this.isEditMode() ? 'Item updated' : 'Item created';
        this.snackBar.open(msg, 'Dismiss', { duration: 3000 });
        this.router.navigate(['/items']);
      },
      error: () => {
        const msg = this.isEditMode() ? 'Failed to update item' : 'Failed to create item';
        this.snackBar.open(msg, 'Dismiss', { duration: 3000 });
        this.submitting.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/items']);
  }
}
