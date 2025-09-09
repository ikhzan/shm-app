import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerService {
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(){}

  show(): void {
    this.loading$.next(true);
  }

  hide(): void {
    this.loading$.next(false);
  }

  isLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

}
