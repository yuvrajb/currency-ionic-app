import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../api/currency.service';
import { Storage } from '@ionic/storage';
import { StorageService } from '../api/storage.service';
import { ICurrency } from '../interfaces/ICurrency';
import { IRate } from '../interfaces/irate';

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
  }

  private renderList(list) {  
    this.currencies = [];

    let latestRates = this.currencyService.getLatestRates(list);
    let values = {};
    latestRates.then((resp) => {
      resp.subscribe((rates :IRate[]) => {
        rates.forEach((rate: IRate) => {
          values[rate.code] = rate.value;
        });

        list.forEach((curr) => {
          curr.value = values[curr.code];
          this.currencies.push(curr);
        });

        // disable loader
        this.loading = false;
      })
    });
  }
}
