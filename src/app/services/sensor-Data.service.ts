import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  constructor(private http: HttpClient) {}

  fetchSensorData(clientId: string, startTime: number, endTime: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `/clients/${clientId}`;
    const body = { start_time: startTime, end_time: endTime };

    return this.http.get(url, { headers: headers, params: body });
  }
}
