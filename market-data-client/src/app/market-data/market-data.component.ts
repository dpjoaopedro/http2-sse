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
  RowDataTransaction,
  ValueFormatterParams,
} from 'ag-grid-community'; // Column Definition Type Interface

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AsyncPipe, NgIf } from '@angular/common';
import { PipsControlRendererComponent } from '../pips-control-renderer/pips-control-renderer.component';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

function currencyFormatter(params: ValueFormatterParams) {
  return 'R$' + formatNumber(params.value);
}

function formatNumber(number: number) {
  return Math.floor(number).toLocaleString();
}

@Component({
  selector: 'app-market-data',
  imports: [AgGridAngular, NgIf, AsyncPipe],
  templateUrl: './market-data.component.html',
})
export class MarketDataComponent implements OnDestroy {
  colDefs: ColDef[] = [
    { field: 'Timestamp', sort: 'desc'},
    { field: 'Id' },
    { field: 'Symbol' },
    {
      field: 'Price',
      cellRenderer: 'agAnimateShowChangeCellRenderer',
      valueFormatter: currencyFormatter,
      filter: 'agNumberColumnFilter',
    },
    { field: 'Pips', cellRenderer: PipsControlRendererComponent },
  ];

  marketData: any[] = [];
  private dataSubscription!: Subscription;
  private gridApi!: GridApi;
  error$!: Observable<boolean>;
  total = signal(0);
  show = signal(0);

  getRowId: GetRowIdFunc = (params: GetRowIdParams) => String(params.data.Id);

  constructor(private marketDataService: MarketDataService) {}

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
    this.marketDataService.closeConnection();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    this.error$ = this.marketDataService.getError();

    this.gridApi.setFilterModel({
      Price: { filterType: 'number', type: 'greaterThan', filter: 100_000 },
    });

    this.dataSubscription = this.marketDataService.getMarketData().subscribe({
      next: (data: RowDataTransaction) => {
        this.gridApi.applyTransactionAsync(data);
        this.show.set(this.gridApi.getDisplayedRowCount());
        const length = data.add ? data.add.length : data.update?.length;
        this.total.set(this.total() + length!);
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

   formatNumberWithDots(number: number) {
    // Convert the number to a string
    let numStr = number.toString();

    // Split the number into integer and decimal parts (if any)
    let parts = numStr.split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    // Add dots as thousand separators
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Combine the integer and decimal parts
    return integerPart + decimalPart;
}
}
