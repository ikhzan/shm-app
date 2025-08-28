import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Subject, BehaviorSubject, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  private socket!: WebSocket;
  private messageSubject = new Subject<any>();
  public messages$ = this.messageSubject.asObservable();
  public status = this.messageSubject.asObservable();

  private statusSubject = new BehaviorSubject<string>('Disconnected');
  public status$: Observable<string> = this.statusSubject.asObservable();

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelayMs = 3000;
  private readonly baseDelayMs = 2000;
  private wsUrl = 'ws://localhost:8000/ws/ttn/';

  constructor() {
    // this.socket = new WebSocket(this.wsUrl);
    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    this.socket = new WebSocket(this.wsUrl);
    if(this.socket){
      
    }

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };

    this.socket.onopen = () => {
      console.log('✅ WebSocket connected');
      this.statusSubject.next('connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
      this.statusSubject.next('disconnected');
      this.scheduleReconnect();
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      this.statusSubject.next('error');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('⚠️ Max reconnect attempts reached');
      return;
    }

    const delay = this.baseDelayMs * Math.pow(2, this.reconnectAttempts); // exponential backoff
    console.log(`🔄 Reconnecting in ${delay / 1000}s... (Attempt ${this.reconnectAttempts + 1})`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connectWebSocket();
    }, delay);
  }

  public reconnectManually(): void {
    console.log('🔧 Manual reconnect triggered');
    this.connectWebSocket();
  }


}
