import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      // Skip 401s — auth interceptor handles those
      if (error.status === 401) {
        return throwError(() => error);
      }

      let message: string;

      if (error.status === 0) {
        message = 'Unable to reach the server';
      } else if (error.error?.message) {
        const raw = error.error.message;
        message = Array.isArray(raw) ? raw.join(', ') : raw;
      } else if (error.statusText) {
        message = error.statusText;
      } else {
        message = 'An unexpected error occurred';
      }

      snackBar.open(message, 'Dismiss', { duration: 5000 });

      return throwError(() => error);
    })
  );
};
