import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Credentials } from '../interfaces/credentials';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private readonly tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(credentials: Credentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/login', credentials).pipe(
      tap((response) => this.storeToken(response.token)),
      catchError((error) => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  getUser(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.user;
    }
    return null;
  }
}
