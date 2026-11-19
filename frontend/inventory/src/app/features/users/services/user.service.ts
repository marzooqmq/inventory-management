import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { User, UserRequest, UserUpdateRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly endpoint = 'users';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<User[]> {
    return this.apiService.get<User[]>(this.endpoint);
  }

  getById(id: number): Observable<User> {
    return this.apiService.get<User>(`${this.endpoint}/${id}`);
  }

  create(user: UserRequest): Observable<User> {
    return this.apiService.post<User>(this.endpoint, user);
  }

  update(id: number, user: UserUpdateRequest): Observable<User> {
    return this.apiService.put<User>(`${this.endpoint}/${id}`, user);
  }
}
