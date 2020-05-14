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

  constructor(private storage: Storage) { }

  /**
   * saves the list in storage
   * @param currencies 
   */
  public saveList(currencies) {
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

  public saveBaseCurrency(currency) {
    this.storage.set('baseCurrency', currency).then((data) => {
      this.baseCurrencySubject.next(currency);
    });
  }

  public getBaseCurrency() {
    return this.storage.get('baseCurrency');
  }
}
