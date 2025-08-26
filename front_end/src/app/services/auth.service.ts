import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Credentials {
  username: string
  password: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private userName = "username";
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) { }

  // 🔐 Login: POST to Django JWT endpoint
  login(credentials: Credentials): Observable<any> {
    return this.http.post<{ access: string; refresh: string, username: string }>(this.apiUrl + 'token/', credentials).pipe(
      tap(tokens => {
        localStorage.setItem(this.accessTokenKey, tokens.access);
        localStorage.setItem(this.refreshTokenKey, tokens.refresh);
        localStorage.setItem(this.userName, tokens.username);
        this.authStatus.next(true);
      })
    );
  }

  // 🚪 Logout: Clear tokens
  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.authStatus.next(false);
  }

  // ✅ Check if user is logged in
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  // 🔄 Refresh token (optional)
  refreshToken(): Observable<any> {
    const refresh = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<{ access: string }>(
      this.apiUrl + 'refresh/',
      { refresh }
    ).pipe(
      tap(response => {
        localStorage.setItem(this.accessTokenKey, response.access);
      })
    );

  }

  // 📦 Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  // 📡 Auth status as observable
  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  // 🧠 Internal helper
  private hasToken(): boolean {
    return !!localStorage.getItem(this.accessTokenKey);
  }


}
