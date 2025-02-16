import { Component } from '@angular/core';
import { MarketDataComponent } from './market-data/market-data.component';

@Component({
  selector: 'app-root',
  imports: [MarketDataComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'market-data-client';
}
