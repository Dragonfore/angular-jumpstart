import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, CreateItemPayload, UpdateItemPayload } from '../models/item.interface';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/items';

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl);
  }

  getItem(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }

  createItem(payload: CreateItemPayload): Observable<Item> {
    return this.http.post<Item>(this.baseUrl, payload);
  }

  updateItem(id: string, payload: UpdateItemPayload): Observable<Item> {
    return this.http.patch<Item>(`${this.baseUrl}/${id}`, payload);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
