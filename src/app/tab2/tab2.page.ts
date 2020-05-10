import { Component } from '@angular/core';
import { CurrencyService } from '../api/currency.service';
import { ICurrency } from '../interfaces/ICurrency';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  // variables
  currencies: ICurrency[];
  searchText: string;

  constructor(private currencyService: CurrencyService,
    public toastController: ToastController) {  }

  ngOnInit() {
    this.currencies = this.currencyService.getCurrencyList();
  }

  // handles click event on a list item
  handleClickEvent(event: any, currency: ICurrency, index: number) {
    let obj = this.getCurrency(currency);
    obj.selected = !obj.selected;
  }

  handleSearchChange(event: any) {
    var searchText = event.target.value;
    this.searchCurrency(searchText);
  }

  public getCurrencies() {
    let list: ICurrency[] = [];

    this.currencies.forEach((currency) => {
      if(currency.show) {
        list.push(currency);
      }
    });

    list.sort((a,b) => {
      if(a.selected && b.selected) { return 0; }
      if(a.selected) { return -1; }
      else if(b.selected) { return 1; }
    });

    // show toast if length is 0
    if(list.length == 0) {
      // let fn = (async function() {
      //   const toast = await this.toastController.create({
      //     message: 'No Currencies Found.',
      //     duration: 2000
      //   });
  
      //   toast.present();
      // }.bind(this));

      // fn();
      console.log("not found");
    }

    return list;
  }

  private searchCurrency(value) {
    this.currencies.forEach((curr, index) => {
      if(curr.code.toLowerCase().indexOf(value.toLowerCase()) != -1 || curr.name.toLowerCase().indexOf(value.toLowerCase()) != -1 || curr.selected) {
        curr.show = true;
      } else {
        curr.show = false;
      }
    });
  }

  private getCurrency(currency) {
    let currencyObj = null;

    this.currencies.forEach((curr) => {
      if(curr.code == currency.code) {
        currencyObj = curr;
      }
    });

    return currencyObj;
  }
}
