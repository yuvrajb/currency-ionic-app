import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import currency_json from '../../assets/currencies/all.json';
import { ICurrency } from '../interfaces/ICurrency';
import { StorageService } from './storage.service';
import { HttpClient } from '@angular/common/http';
import { IRate } from '../interfaces/irate';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // variables
  baseUrl = environment.baseUrl;
  apiKey = environment.apiKey;
  decimalPlaces : number = null;
  baseCurrency: string = null;

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
      if(curr == null) { // by default it will be INR
        baseCurrency = "INR";
      } else {
        baseCurrency = curr;
      }

      // save in calss
      this.baseCurrency = baseCurrency;
      
      // default decimal places will be 2
      if(decimalPlaces == null || decimalPlaces == -1) {
        decimalPlaces = 2;
      }

      // save in class
      this.decimalPlaces = decimalPlaces;

      // check whether base currency exists in the list of currencies for which rates need to be fetched
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

      // fire request to fixer api
      let latestRates: IRate[] = [];

      // fetch data locally if available
      return this.storageService.getLatestCurrencyRates(baseCurrency, currList).then((dt) => {
        latestRates = dt;

        // already fetched
        var alreadyFetched = [];
        latestRates.forEach((curr) => {
          alreadyFetched.push(curr.code);
        });

        // to be fetched array
        var toBeFetched = currList.split(",");

        var newCurrList = [];
        toBeFetched.forEach((code) => {
          if(alreadyFetched.indexOf(code) == -1) {
            newCurrList.push(code);
          }
        });

        // hit fixer only if there's any currency value to be fetched
        if(newCurrList.length > 0) {
          // check whether base currency is there or not
          var baseNotExists = newCurrList.indexOf(baseCurrency) == -1;
          if(baseNotExists) {
            newCurrList.push(baseCurrency);
          }
          currList = newCurrList.join(",");
          params["symbols"] = currList;

          return this.http.get(this.baseUrl + "latest", {params: params}).pipe(map((resp) => {
            let status = (resp as any).success;
    
            if(status) {
              let rates = (resp as any).rates;
              
              let baseRate = null;
              let localCurrencies = [];
              for(var code in rates) {
                latestRates.push({code: code, value: rates[code], timestamp: new Date()});
                if(code == baseCurrency) {
                  baseRate = rates[code];
                }
    
                let obj = {code: code, value: rates[code]};
                localCurrencies.push(obj);
              }
    
              // store these rates locally
              this.storageService.setCurrencyRates(localCurrencies, baseCurrency, (resp as any).date, "latest"); // YYYY-MM-DD
    
              latestRates.forEach((rate: IRate) => {
                rate.value = parseFloat((baseRate / rate.value).toFixed(decimalPlaces));
              });
    
              return latestRates;
            } else {
              
            }
          }));
        } else {
          let baseRate = null;
          latestRates.forEach((rate: IRate) => {
            if(rate.code == baseCurrency) {
              baseRate = rate.value;
            }
          });

          latestRates.forEach((rate: IRate) => {
            rate.value = parseFloat((baseRate / rate.value).toFixed(decimalPlaces));
          });

          return of(latestRates);
        }
      })
    }); 
  }

  /**
   * hits the API endpoint to get yesteday's currency rates
   * @param list 
   * @param decimalPlaces 
   */
  public getHistoricalRates(list) {
    // prepare params
    let params = {};
    params["access_key"] = this.apiKey;
    let currList = "";

    // fire request to fixer api
    let historicalRates: IRate[] = [];

    // check whether base currency exists in the list of currencies for which rates need to be fetched
    let baseExists = false;
    list.forEach((curr) => {
      if(curr.code == this.baseCurrency) {
        baseExists = true;
      }
      currList += curr.code + ",";
    });

    if(!baseExists) {
      currList += this.baseCurrency + ",";
    }

    // save in params 
    params["symbols"] = currList;

    // fetch yesterday
    const yest = moment().subtract(1, 'days').format("YYYY-MM-DD");

    // fetch data if locally available
    return this.storageService.getHistoricalCurrencyRates(this.baseCurrency, currList).then((dt) => {
      historicalRates = dt;

      console.log("Historical Rates Fetched");
      console.log(historicalRates);

       // already fetched
       var alreadyFetched = [];
       historicalRates.forEach((curr) => {
         alreadyFetched.push(curr.code);
       });

       // to be fetched array
       var toBeFetched = currList.split(",");

       var newCurrList = [];
       toBeFetched.forEach((code) => {
         if(alreadyFetched.indexOf(code) == -1) {
           newCurrList.push(code);
         }
       });

       console.log("To be Fetched");
       console.log(newCurrList);

       if(newCurrList.length > 0) {
         // check whether base currency is there or not
         var baseNotExists = newCurrList.indexOf(this.baseCurrency) == -1;
         if(baseNotExists) {
           newCurrList.push(this.baseCurrency);
         }
         currList = newCurrList.join(",");
         params["symbols"] = currList;

         return this.http.get(this.baseUrl + yest, {params: params}).pipe(map((resp) => {
          let status = (resp as any).success;
    
          if(status) {
            let rates = (resp as any).rates;
            
            let baseRate = null;
            let localCurrencies = [];
            for(var code in rates) {
              historicalRates.push({code: code, value: rates[code], timestamp: new Date()});
              if(code == this.baseCurrency) {
                baseRate = rates[code];
              }
    
              let obj = {code: code, value: rates[code]};
              localCurrencies.push(obj);
            }
    
            // store these rates locally
            this.storageService.setCurrencyRates(localCurrencies, this.baseCurrency, yest, "historical"); // YYYY-MM-DD
    
            historicalRates.forEach((rate: IRate) => {
              rate.value = parseFloat((baseRate / rate.value).toFixed(this.decimalPlaces));
            });
    
          return historicalRates;
          } else {
            
          }
        }));
       } else {
        let baseRate = null;
        historicalRates.forEach((rate: IRate) => {
          if(rate.code == this.baseCurrency) {
            baseRate = rate.value;
          }
        });

        historicalRates.forEach((rate: IRate) => {
          rate.value = parseFloat((baseRate / rate.value).toFixed(this.decimalPlaces));
        });

        return of(historicalRates);
       }
    });

    
  }
}
