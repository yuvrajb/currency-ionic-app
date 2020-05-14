import { Component } from '@angular/core';
import { CurrencyService } from '../api/currency.service';
import { ICurrency } from '../interfaces/ICurrency';
import { StorageService } from '../api/storage.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  // variables
  currencies: ICurrency[];
  baseCurrency: string;

  constructor(private currencyService: CurrencyService,
    private storageService: StorageService) {}

  ngOnInit() {
    this.currencies = this.currencyService.getCurrencyList();

    this.currencies.sort((a,b) => {
      return a.name.localeCompare(b.name);
    });

    this.storageService.getBaseCurrency().then((code) => {
      this.baseCurrency = code;
    })
  }

  handleBaseCurrencyChange(event) {
    let curr_code = event.detail.value;

    this.storageService.saveBaseCurrency(curr_code);
  }
}
