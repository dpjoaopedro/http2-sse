import { Component, inject, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IRowNode } from 'ag-grid-community';
import { MarketDataService } from '../market-data/market-data.service';

@Component({
  selector: 'app-pips-control-renderer',
  imports: [],
  templateUrl: './pips-control-renderer.component.html',
  styleUrl: './pips-control-renderer.component.css',
})
export class PipsControlRendererComponent implements ICellRendererAngularComp {
 
  private marketDataService = inject(MarketDataService);
  private node!: IRowNode;

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.node = params.node;
  }

  refresh(params: ICellRendererParams) {
    console.log(params)
    return false;
  }

  sendPips(param: '+' | '-') {
    this.marketDataService.updateMarketData(this.node.data, param);
  }
}
