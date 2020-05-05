import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import currency_json from '../../assets/currencies/all.json';
import { ICurrency } from '../interfaces/ICurrency';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // variables
  baseUrl = environment.baseUrl;
  apiKey = environment.apiKey;

  constructor() { }

  public getCurrencyList() {
    var temp = [];
    for(var currency in currency_json) {
      temp.push(currency_json[currency]);
    }

    return temp.map((currency) => {
      return <ICurrency> {
        code: currency.code,
        decimal_digits: currency.decimal_digits,
        name: currency.name,
        name_plural: currency.name_plural,
        rounding: currency.rounding,
        symbol: currency.symbol,
        symbol_native: currency.symbol_native,
        selected: false
      }
    })
  }
}
