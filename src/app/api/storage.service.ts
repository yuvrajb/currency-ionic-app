import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

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
}
