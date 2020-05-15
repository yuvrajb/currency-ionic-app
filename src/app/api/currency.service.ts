import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import currency_json from '../../assets/currencies/all.json';
import { ICurrency } from '../interfaces/ICurrency';
import { StorageService } from './storage.service';
import { HttpClient } from '@angular/common/http';
import { IRate } from '../interfaces/irate';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // variables
  baseUrl = environment.baseUrl;
  apiKey = environment.apiKey;
  decimalPlaces : number = null;

  constructor(private storageService: StorageService,
    private http: HttpClient) {
      
  }

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
        selected: false,
        show: true
      }
    })
  }

  /**
   * hits the API endpoint to get the latest currencies
   * @param list 
   */
  public getLatestRates(list, decimalPlaces: number = 2) {
    let currList = "";
    let baseCurrency = null;

    return this.storageService.getBaseCurrency().then((curr) => {       
      if(curr == null) {
        baseCurrency = "INR";
      } else {
        baseCurrency = curr;
      }
      
      if(decimalPlaces == null) {
        decimalPlaces = 2;
      }

      let baseExists = false;
      list.forEach((curr) => {
        if(curr.code == baseCurrency) {
          baseExists = true;
        }
        currList += curr.code + ",";
      });

      if(!baseExists) {
        currList += baseCurrency + ",";
      }
  
      // get the final list
      currList = currList.substr(0, currList.length - 1);
  
      // prepare params
      let params = {};
      params["access_key"] = this.apiKey;
      params["symbols"] = currList;
  
      //fire request
      return this.http.get(this.baseUrl + "latest", {params: params}).pipe(map((resp) => {
        let status = (resp as any).success;

        if(status) {
          let rates = (resp as any).rates;
          let latestRates: IRate[] = [];
          let baseRate = null;
          for(var code in rates) {
            latestRates.push({code: code, value: rates[code]});
            if(code == baseCurrency) {
              baseRate = rates[code];
            }
          }

          latestRates.forEach((rate: IRate) => {
            rate.value = parseFloat((baseRate / rate.value).toFixed(decimalPlaces));
          });

          return latestRates;
        } else {
          
        }
      }));
    }); 
  }
}
