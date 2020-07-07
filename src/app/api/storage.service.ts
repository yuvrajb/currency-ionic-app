import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { identifierModuleUrl } from '@angular/compiler';
import { IRate } from '../interfaces/irate';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storageSubject = new BehaviorSubject(null);
  public storageObj = this.storageSubject.asObservable();

  private baseCurrencySubject = new BehaviorSubject(null);
  public baseCurrency = this.baseCurrencySubject.asObservable();

  private decimalPlacesSubject = new BehaviorSubject(null);
  public decimalPlaces = this.decimalPlacesSubject.asObservable();

  constructor(private storage: Storage) { }

  /**
   * saves the list in storage
   * @param currencies 
   */
  public setList(currencies) {
    this.storage.set('storedCurrencies', currencies).then((data) => {
      this.storageSubject.next(currencies);
    });    
  }

  /**
   * fetches the list of currencies from storage
   */
  public getList() {
    return this.storage.get('storedCurrencies');
  }

  /**
   * saves the base currency
   * @param currency 
   */
  public setBaseCurrency(currency) {
    return this.storage.set('baseCurrency', currency).then((data) => {
      this.baseCurrencySubject.next(currency);
    });
  }

  /**
   * gets the base currency
   */
  public getBaseCurrency() {
    return this.storage.get('baseCurrency');
  }

  /**
   * gets the decimal places saved
   */
  public getDecimalPlaces() {
    return this.storage.get('decimalPlaces');
  }

  /**
   * saves the decimal places
   * @param decimal 
   */
  public setDecimalPlaces(decimal) {
    return this.storage.set('decimalPlaces', decimal).then((data) => {
      this.decimalPlacesSubject.next(data);
    });
  }

    /**
   * fetches the data locally stored in database key
   * @param baseCurrency 
   * @param currList 
   */
  public getLatestCurrencyRates(baseCurrency, currList) {
    // storage
    let latestRates: IRate[] = [];

    // split the currList and store in array
    var toBeFetched = currList.split(",");

    // fetch database object
    return this.storage.get('database').then((db) => {
      // now fetch the data with the key
      if(db != null && (db[baseCurrency] != undefined || db[baseCurrency] != null)) {
        var baseCurrencyObj = db[baseCurrency];
        var today = new Date();
        today.setUTCHours(0,0,0,0);
        var time = today.getTime();
      
        // now fetch the data via time
        if(baseCurrencyObj[time] != undefined || baseCurrencyObj[time] != null) {
          var currencies = baseCurrencyObj[time];

          // parse through each and try to find rates
          currencies.forEach((curr, index) => {
            if(curr != null) {
              var lastChecked = curr.lastChecked;
              var now = (new Date()).getTime();
  
              // data will be stale if it's more than an hour ago
              if(toBeFetched.indexOf(curr.code) != -1 && now - lastChecked <= 3600000) {
                var currObj: IRate = {code: curr.code, value: curr.rate, timestamp: new Date()};
                latestRates.push(currObj);
              } else {
                // delete the older data
                delete currencies[index];
              }
            } else { // delete the older data
              delete currencies[index];
            }
          });

          // filter out empty values
          baseCurrencyObj[time] = baseCurrencyObj[time].filter((obj) => obj != null ? true : false);
        } else { // delete the older data
          delete baseCurrencyObj[time];
        }  

        // delete other time entries
        for(var timeKey in db[baseCurrency]) {
          if(timeKey != "" + time) {
            delete db[baseCurrency][timeKey];
          }
        }
        
        // save the updated db
        this.storage.set('database', db);
      }

      // finally send the list of currency rates fetched from storage
      return latestRates;
    });
  }

  /**
   * fetches historical data stored locally
   * @param baseCurrency 
   * @param currList 
   */
  public getHistoricalCurrencyRates(baseCurrency, currList) {
    // storage
    let historicalRates: IRate[] = [];

    // split the currList and store in array
    var toBeFetched = currList.split(",");

    // fetch database object
    return this.storage.get('history').then((db) => {
      // now fetch the data with the key
      if(db != null && (db[baseCurrency] != undefined || db[baseCurrency] != null)) {
        var baseCurrencyObj = db[baseCurrency];
        const time = new Date(moment().subtract(1, 'days').format("YYYY-MM-DD")).getTime();
      
        // now fetch the data via time
        if(baseCurrencyObj[time] != undefined || baseCurrencyObj[time] != null) {
          var currencies = baseCurrencyObj[time];

          // parse through each and try to find rates
          currencies.forEach((curr, index) => {
            var currObj: IRate = {code: curr.code, value: curr.rate, timestamp: new Date()};
            historicalRates.push(currObj);
          })
        }   
        
        // remove any other historical data
        for(var timeKey in baseCurrencyObj) {
          if(timeKey != "" + time) {
            delete baseCurrencyObj[timeKey];
          }
        }
      }

      // save the refresh list in db
      this.storage.set('history', db);

      // finally send the list of currency rates fetched from storage
      return historicalRates;
    });
  }


  /**
   * refactored function in lieu of setLatestCurrencyRates & setHistoricalCurrencyRates
   * @param currencies 
   * @param baseCurrency 
   * @param date 
   * @param type 
   */
  public setCurrencyRates(currencies, baseCurrency, date, type) {
    var baseIsNull = true;
    var dataStore = type == "latest" ? "database" : "history";

    // parse currencies once
    var currProcessedIndex = [];
    var currencyStorage = [];
    currencies.forEach((curr) => {
      currencyStorage.push(curr.code);
      currProcessedIndex.push(false);
    });

    // first fetch the date
    this.storage.get(dataStore).then((db) => {
      if(db == null) {
        db = {};
      }

      // parse through keys and try to find out the key with base Currency
      var baseCurrencyObj = null;
      var dateArray = null;

      for(var key in db) {
        if(key == baseCurrency) {
          baseCurrencyObj = db[key];
        }
      }

      var dateKey = ((new Date(date)).getTime()); 

      // if base currency obj is null then create a new one
      if(baseCurrencyObj == null) {
        db[baseCurrency] = {};
        db[baseCurrency]["" + dateKey] = [];
      }
      
      // find the key with today's date timestamp
      for(var key in db[baseCurrency]) {
        if(key == "" + dateKey) {
          dateArray = db[baseCurrency][key];
        } else {
          var diff = dateKey - parseInt(key);
          console.log(diff);
          var timeThreshold = type == "latest" ? 86400000 : (86400000 * 2);
          if(diff > timeThreshold) { // delete if diff is more than threshold
            delete db[baseCurrency][key];
          }
        }
      }

      // if date timestamp key is not found then create a new array
      if(dateArray == null) {
        dateArray = [];
      }

      // check whether base currency is there
      console.log("scanning dateArray");
      console.log(dateArray);
      dateArray.forEach((curr, index) => {
        if(curr != null && curr.code == baseCurrency) {
          baseIsNull = false;
        }
      });

      // process the remaining currencies
      currProcessedIndex.forEach((processed, currIndex) => {
        if(!processed && (currencies[currIndex].code != baseCurrency) || baseIsNull) {
          var currObj = {code: currencies[currIndex].code, rate: currencies[currIndex].value, lastChecked: new Date().getTime()};

          dateArray.push(currObj);
        }
      })

      // update the collection
      db[baseCurrency]["" + dateKey] = dateArray;
      
      // finally save the objecet
      this.storage.set(dataStore, db);
    });
  }
}
