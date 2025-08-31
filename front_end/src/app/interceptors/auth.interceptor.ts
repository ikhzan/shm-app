// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const isRefreshRequest = req.url.includes('/api/refresh/');

  const authReq = token && !isRefreshRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // ✅ Only attempt refresh if it's not already a refresh request
      if (error.status === 401 && !isRefreshRequest) {
        return authService.refreshToken().pipe(
          switchMap(newToken => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            authService.logout(); // ✅ Clear tokens and redirect
            return throwError(() => new Error('Session expired'));
          })
        );
      }

      return throwError(() => error);
    })
  );
};