import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../api/currency.service';
import { Storage } from '@ionic/storage';
import { StorageService } from '../api/storage.service';
import { ICurrency } from '../interfaces/ICurrency';
import { IRate } from '../interfaces/irate';
import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';
import { AlertController } from '@ionic/angular';

import * as numeral from 'numeral';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {   
  currencies: ICurrency[] = [];
  loading: Boolean = true;
  decimal: number;
  showBin: Boolean = false;
  showNoCurrencyMessage: Boolean = true;

  constructor(private currencyService: CurrencyService,
    private storageService: StorageService,
    public alertController: AlertController,
    private router: Router) {
  }

  /**
   * makes sure that no currency message is always in the center
   * */
  ngAfterContentChecked() {
    this.adjustNoCurrencyPosition();
  }

  ngOnInit() {    
    this.storageService.getList().then((list) => {
      if(list != null || list.length != 0) {
        this.storageService.getDecimalPlaces().then((decimal) => {
          this.decimal = decimal;
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
        this.decimal = decimal;
        const currenciesList = JSON.parse(JSON.stringify(this.currencies));

        this.renderList(currenciesList, decimal);
      }
    });

    this.adjustNoCurrencyPosition();
  }

  /**
   * responsible to show no currency element in the center of the sceen
   */
  adjustNoCurrencyPosition() {
    var obj = document.getElementById("no-currency");
    if(obj != null) {
      var marginTop = ((window.innerHeight - 57) / 2 - 100)
      obj.style.marginTop = marginTop + "px";
      obj.style.display = "block";
    }
  }

  /**
   * shows the tiles on the screen each for selected currency
   * @param list 
   */
  private renderList(list, decimal = 2) {  
    this.loading = true;
    this.decimal = decimal;

    // set whether to show no currency message or not
    if(list.length != 0) {
      this.showNoCurrencyMessage = false;
    } else {
      this.showNoCurrencyMessage = true;
      console.log(document.getElementById("no-currency"));
      setTimeout(() => this.adjustNoCurrencyPosition(), 200);
    }

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
          curr.total_value_str = this.formatNumber(curr.total_value, decimal);
          curr.position = this.backgroundPosition();
          this.currencies.push(curr);
        });
        
        // sort the collection
        this.currencies.sort((a,b) => {    
          return a.name.localeCompare(b.name);
        });

        // disable loader
        this.loading = false;

        // fetch historical rates
        let historicalRates = this.currencyService.getHistoricalRates(list);
        let histValue =  {};
        console.log("Historical Rates");
        historicalRates.then().then((resp) => {
          resp.subscribe((rates: IRate[]) => {
            // refresh the list with the historical rates
            this.currencies = [];

            list.forEach((curr) => {
              const hist = rates.filter((hist_curr) => hist_curr.code == curr.code)[0];
              if(curr.base_value > hist.value) {
                curr.trend = "fa fa-chevron-circle-up";
                curr.trend_class = "trend-up";
              } else if (curr.base_value <= hist.value) {
                curr.trend = "fa fa-chevron-circle-down";
                curr.trend_class = "trend-down";
              } else {
                curr.trend = "";
                curr.trend_class = "";
              }

              curr.diff = (curr.base_value - hist.value).toFixed(2);
            });

            this.currencies = list;
          });
        });
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
          placeholder: 'Enter Amount',
          value: multiplier == 1 ? null : multiplier
        }
      ],
      buttons: [
        {
          text: 'Apply All',
          cssClass: 'secondary',
          handler: data => {
            var amount = data.value;
            if(amount == 0) {
              amount = 1;
            }

            this.currencies.forEach((curr) => {
              curr.multiplier = parseFloat(amount);            
              curr.total_value = parseFloat((curr.base_value * curr.multiplier).toFixed(this.decimal));
              curr.total_value_str = this.formatNumber(curr.total_value, this.decimal);
            });

            this.determineBinButtonShow();
          }
        },
        {
          text: 'OK',
          handler: data => {
            var amount = data.value;
            if(amount == 0) {
              amount = 1;
            }            

            curr.multiplier = parseFloat(amount);            
            curr.total_value = parseFloat((curr.base_value * curr.multiplier).toFixed(this.decimal));
            curr.total_value_str = this.formatNumber(curr.total_value, this.decimal);

            this.determineBinButtonShow();
          }
        }
      ]
    });

    await prompt.present().then(() => {
      const firstInput : any= document.querySelector('ion-alert input');
      firstInput.focus();
      return
    });
  }

  /**
   * format the number using numeral
   * @param num 
   * @param decimal 
   */
  public formatNumber(num, decimal) {
    if(decimal == 2) {
      return numeral(num).format('0,0.00');
    } else if(decimal == 3) {
      return numeral(num).format('0,0.000');
    }

    return numeral(num).format('0,0');
  }

  /**
   * this function determins whether to show bin button
   */
  public determineBinButtonShow() {
    var show = false;

    this.currencies.forEach((curr) => {
      if(curr.multiplier != 1) {
        show = true;
      }
    });

    this.showBin = show;
  }

  /**
   * this function will clear all values provided for calculations
   */
  public clearValues() {
    this.currencies.forEach((curr) => {
      curr.multiplier = 1;
      curr.total_value = curr.base_value;
      curr.total_value_str = this.formatNumber(curr.total_value, this.decimal);
    });

    this.showBin = false;
  }

  /**
   * navigates to second tab
   */
  public navigateToCurrencies() {
    this.router.navigate(['/tabs/tab2']);
  }
}
