import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MarketDataService {
  private eventSource: EventSource | null = null;
  private dataSubject = new Subject<any>();
  private errorSubject = new Subject<any>();
  private reconnectAttempts = 5; // Max reconnect attempts
  private reconnectDelay = 3000; // Delay between reconnects (ms)
  private apiUrl = 'https://localhost:5181/api/marketdata'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  // Example: Send market data to the server
  sendMarketData(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getMarketData(): Observable<any> {
    this.connectToSSE();
    return this.dataSubject.asObservable().pipe(
      catchError((error) => {
        console.error('SSE error:', error);
        this.reconnect();
        return throwError(error);
      })
    );
  }

  getError() {
    return this.errorSubject.asObservable();
  }

  private connectToSSE() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(this.apiUrl + '/stream');

    this.eventSource.onopen = () => {
      console.error('CONNECTED');
      this.errorSubject.next(false);
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.dataSubject.next(data);
      } catch (error) {
        this.dataSubject.error(error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.errorSubject.next(true);
      this.reconnect();
    };
  }

  private reconnect() {
    if (this.reconnectAttempts > 0) {
      this.reconnectAttempts--;
      console.log(`Reconnecting in ${this.reconnectDelay / 1000} seconds...`);
      setTimeout(() => this.connectToSSE(), this.reconnectDelay);
    } else {
      console.error('Max reconnect attempts reached. Giving up.');
      this.closeConnection();
      this.dataSubject.error('Max reconnect attempts reached');
    }
  }

  closeConnection() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
