import { Component, OnDestroy, signal } from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { MarketDataService } from './market-data.service';

import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import type {
  ColDef,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community'; // Column Definition Type Interface

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AsyncPipe, NgIf } from '@angular/common';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-market-data',
  imports: [AgGridAngular, NgIf, AsyncPipe],
  templateUrl: './market-data.component.html',
})
export class MarketDataComponent implements OnDestroy {
  colDefs: ColDef[] = [
    { field: 'Timestamp', sort: 'desc' },
    { field: 'Id' },
    { field: 'Symbol' },
    { field: 'Price' },
  ];

  marketData: any[] = [];
  private dataSubscription!: Subscription;
  private gridApi!: GridApi;
  error$!: Observable<boolean>;
  size = signal(0);

  getRowId: GetRowIdFunc = (params: GetRowIdParams) =>
    String(params.data.Id);

  constructor(private marketDataService: MarketDataService) {}

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
    this.marketDataService.closeConnection();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    this.error$ = this.marketDataService.getError().pipe(tap(console.log));

    this.dataSubscription = this.marketDataService.getMarketData().subscribe({
      next: (add: unknown[]) => {
        this.size.set(this.size() + add.length);
        this.gridApi.applyTransactionAsync({
          add,
        });
      },
      error: (err) => console.error('SSE error:', err),
    });
  }

  sendData() {
    const marketData = {
      symbol: 'AAPL',
      price: 150.25,
      timestamp: new Date().toISOString(),
    };

    this.marketDataService.sendMarketData(marketData).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error('Error sending data:', err);
      },
    });
  }
}
