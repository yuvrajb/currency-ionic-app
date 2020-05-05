import { Component } from '@angular/core';
import { CurrencyService } from '../api/currency.service';
import { ICurrency } from '../interfaces/ICurrency';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  // variables
  currencies: ICurrency[];

  constructor(private currencyService: CurrencyService) {  }

  ngOnInit() {
    this.currencies = this.currencyService.getCurrencyList();
  }

  handleClickEvent(event: any, currency: ICurrency, index: number) {
    this.currencies[index].selected = !this.currencies[index].selected;
  }
}
