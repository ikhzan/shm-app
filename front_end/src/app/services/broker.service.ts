import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Subject, BehaviorSubject, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  private socket: WebSocket;
  private messageSubject = new Subject<any>();
  public messages$ = this.messageSubject.asObservable();
  public status =  this.messageSubject.asObservable();

  private statusSubject = new BehaviorSubject<string>('Disconnected');
  public status$: Observable<string> = this.statusSubject.asObservable();

  constructor() {
    this.socket = new WebSocket('ws://localhost:8000/ws/ttn/');

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };
    
    this.socket.onopen = () => {
      console.log('✅ WebSocket connected');
      this.statusSubject.next('connected');
    };
    this.socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
      this.statusSubject.next('disconnected');
    };
    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      this.statusSubject.next('error');
    };
  }

}
