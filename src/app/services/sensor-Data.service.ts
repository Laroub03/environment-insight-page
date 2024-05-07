import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { ClientData } from '../interfaces/clientData';

@Injectable({
  providedIn: "root",
})
export class SensorDataService {
  private clientsData: Array<ClientData> = [];
  private clientsDataSubject$: Subject<ClientData[]> = new BehaviorSubject<ClientData[]>(
    this.clientsData,
  );

  // Can only be subscribed to, as the subject is now an observable.
  clientsData$: Observable<ClientData[]> = this.clientsDataSubject$.asObservable();

  constructor(private http: HttpClient) {}

  fetchSensorData(
    clientId: string,
    startTime: number,
    endTime: number,
  ): Observable<ClientData[]> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const url = `/clients/${clientId}/data`;
    const body = { start_time: startTime, end_time: endTime };

    this.http.post<ClientData[]>(url, body, { headers }).subscribe((clients) => {
      this.clientsData = clients;

      this.clientsDataSubject$.next(this.clientsData);
    });

    return this.http.post<any[]>(url, body, { headers: headers }).pipe(
      map((response) => response.map((item) => this.convertToClientData(item))),
      catchError((error) => {
        console.error("Error fetching sensor data", error);
        return of([]);
      }),
    );
  }

  private convertToClientData(item: any): ClientData {
    return {
      id: item.id,
      timestamp: item.timestamp,
      light: item.light,
      temperature: item.temperature,
      humidity: item.humidity,
      pressure: item.pressure,
      altitude: item.altitude,
    };
  }
}