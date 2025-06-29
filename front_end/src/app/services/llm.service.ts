import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LlmService {
 private apiUrl = 'http://localhost:8000/api/sensors/ask/';

  constructor(private zone: NgZone) {}

  streamResponse(prompt: string): Observable<string> {
    return new Observable(observer => {
      fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      }).then(async res => {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          this.zone.run(() => observer.next(chunk));
        }

        this.zone.run(() => observer.complete());
      }).catch(err => {
        this.zone.run(() => observer.error(err));
      });
    });
  }


}
