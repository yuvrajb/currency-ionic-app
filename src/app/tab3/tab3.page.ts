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
  decimalPlace: string;
  loading: boolean = true;

  constructor(private currencyService: CurrencyService,
    private storageService: StorageService) {}

  ngOnInit() {
    this.currencies = this.currencyService.getCurrencyList();

    this.currencies.sort((a,b) => {
      return a.name.localeCompare(b.name);
    });

    this.storageService.getBaseCurrency().then((code) => {
      if(code == null) {
        code = "INR"; // by default INR
      }
      this.baseCurrency = code;
    });

    this.storageService.getDecimalPlaces().then((decimal) => {
      if(decimal == null) {
        decimal = "2";
      } 
      this.decimalPlace = decimal;
    });
  }

  /**
   * handles change event for base currency
   * @param event 
   */
  handleBaseCurrencyChange(event) {
    let curr_code = event.detail.value;

    this.loading = true;
    this.storageService.setBaseCurrency(curr_code).then((dt) => {
      this.loading = false;
    });
  }

  /**
   * handles change event for decimal change
   * @param event 
   */
  handeDecimalPlaceChange(event) {
    let curr_decimal_place = event.detail.value;

    this.loading = true;
    this.storageService.setDecimalPlaces(curr_decimal_place).then((dt) => {
      this.loading = false;
    });
  }
}
