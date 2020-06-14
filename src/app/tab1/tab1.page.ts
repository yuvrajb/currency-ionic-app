import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../api/currency.service';
import { Storage } from '@ionic/storage';
import { StorageService } from '../api/storage.service';
import { ICurrency } from '../interfaces/ICurrency';
import { IRate } from '../interfaces/irate';
import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {   
  currencies: ICurrency[] = [];
  loading: Boolean = true;
  decimal: number;

  constructor(private currencyService: CurrencyService,
    private storageService: StorageService,
    public alertController: AlertController) {
  }

  ngOnInit() {
    this.storageService.getList().then((list) => {
      if(list != null) {
        this.storageService.getDecimalPlaces().then((decimal) => {
          this.renderList(list, decimal);
        });
      }
    });
    this.storageService.storageObj.subscribe((list) => {
      if(list != null) {
        this.renderList(list);
      }
    });
    this.storageService.baseCurrency.subscribe((base) => {      
      if(base != null) {
        this.renderList(this.currencies);
      }
    });
    this.storageService.decimalPlaces.subscribe((decimal) => {
      if(decimal != null) {
        const currenciesList = JSON.parse(JSON.stringify(this.currencies));
        this.renderList(currenciesList, decimal);
        console.log(decimal);
      }
    })
  }

  /**
   * shows the tiles on the screen each for selected currency
   * @param list 
   */
  private renderList(list, decimal = 2) {  
    this.loading = true;
    this.decimal = decimal;

    let latestRates = this.currencyService.getLatestRates(list, decimal);
    let values = {};
    latestRates.then().then((resp) => {      
      resp.subscribe((rates :IRate[]) => {
        console.log(rates);
        this.currencies = [];

        rates.forEach((rate: IRate) => {
          values[rate.code] = rate.value;
        });

        list.forEach((curr) => {
          curr.base_value = values[curr.code];
          curr.multiplier = 1;
          curr.total_value = curr.base_value * curr.multiplier;
          curr.position = this.backgroundPosition();
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

  /**
   * randomize background positions
   */
  public backgroundPosition() {
    return ((Math.random() * 31) + 70) + "%";
  }

  /**
   * hanldes tap on rate tiles
   */
  public async handleTileTap(event, index) {
    const curr = this.currencies[index];
    const multiplier = curr.multiplier;
    
    const prompt = await this.alertController.create({
      header: curr.code,
      subHeader: 'Enter Amount',
      message: 'Type amount in ' + curr.code + ' to get value in your base currency',
      inputs: [
        {
          name: 'value',
          type: 'number',
          placeholder: 'Enter Amount'
        },
        {
          name: 'all',
          type: 'checkbox',
          label: 'Calculate All?'
        }
      ],
      buttons: [
        {
          text: 'OK',
          handler: data => {
            var amount = data.value;
            if(amount == 0) {
              amount = 1;
            }            

            curr.multiplier = parseFloat(amount);            
            curr.total_value = parseFloat((curr.base_value * curr.multiplier).toFixed(this.decimal));
          }
        }
      ]
    });

    await prompt.present();
  }
}
