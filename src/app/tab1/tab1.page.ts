import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../api/currency.service';
import { Storage } from '@ionic/storage';
import { StorageService } from '../api/storage.service';
import { ICurrency } from '../interfaces/ICurrency';
import { IRate } from '../interfaces/irate';
import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {   
  currencies: ICurrency[] = [];
  loading: Boolean = true;

  constructor(private currencyService: CurrencyService,
    private storageService: StorageService) {
  }

  ngOnInit() {
    this.storageService.getList().then((list) => {
      if(list != null) {
        this.renderList(list);
      }
    });
    this.storageService.storageObj.subscribe((list) => {
      if(list != null) {
        this.renderList(list);
      }
    });
    this.storageService.baseCurrency.subscribe((base) => {
      console.log(base);
      if(base != null) {
        this.renderList(this.currencies);
      }
    });
  }

  /**
   * shows the tiles on the screen each for selected currency
   * @param list 
   */
  private renderList(list) {  
    this.loading = true;

    let latestRates = this.currencyService.getLatestRates(list);
    let values = {};
    latestRates.then((resp) => {      
      resp.subscribe((rates :IRate[]) => {
        this.currencies = [];

        rates.forEach((rate: IRate) => {
          values[rate.code] = rate.value;
        });

        list.forEach((curr) => {
          curr.value = values[curr.code];
          this.currencies.push(curr);
        });
        
        // sort the collection
        this.currencies.sort((a,b) => {    
          return a.name.localeCompare(b.name);
        });

        // disable loader
        this.loading = false;
      })
    });
  }
}
