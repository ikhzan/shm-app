import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private apiUrl = 'http://localhost:8000/api/sensors/';

  constructor(private http: HttpClient) { }

  fetchDataSensor() : Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + "all/")
  }

  fetchDataDevice(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + "endall/")
  }
}
