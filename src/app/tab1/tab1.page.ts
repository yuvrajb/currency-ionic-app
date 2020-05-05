import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../api/currency.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
   
  constructor(private currencyService: CurrencyService) {
  }

}
