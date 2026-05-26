import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthResponse, LoginPayload, RegisterPayload } from '../models/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = 'http://localhost:3000/api/auth';

  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  readonly isLoggedIn$ = this.tokenSubject.pipe(map((t) => !!t));

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  login(email: string, password: string) {
    const payload: LoginPayload = { email, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => this.tokenSubject.next(res.accessToken))
    );
  }

  register(email: string, password: string, name?: string) {
    const payload: RegisterPayload = { email, password, ...(name ? { name } : {}) };
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap((res) => this.tokenSubject.next(res.accessToken))
    );
  }

  logout(): void {
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }
}
