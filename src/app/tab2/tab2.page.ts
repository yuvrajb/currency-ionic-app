import { Component } from '@angular/core';
import { CurrencyService } from '../api/currency.service';
import { ICurrency } from '../interfaces/ICurrency';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { StorageService } from '../api/storage.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  // variables
  currencies: ICurrency[];
  searchText: string;
  storedCurrencies: any = [];
  loading: boolean = true;
  showCurrencies: boolean = false;

  constructor(private currencyService: CurrencyService,
    public toastController: ToastController,
    private storageService: StorageService,
    private storage: Storage) {  }

  ngOnInit() {
    this.currencies = this.currencyService.getCurrencyList();

    this.storageService.getList().then((list) => {
      if(list != null) {
        list.forEach((curr) => {
          this.storedCurrencies.push(curr);          
        });
      }      

      this.showCurrencies = true;
      this.loading = false;
    });
  }

  // handles click event on a list item
  handleClickEvent(event: any, currency: ICurrency, index: number) {
    let obj = this.getCurrency(currency);
    obj.selected = !obj.selected;

    // push into storeadCurrencies arr
    if(obj.selected) {
      this.storedCurrencies.push(currency);
    } else {
      let index = this.storedCurrencies.findIndex((curr) => {
        if(curr.code == currency.code) {
          return true;
        }
      });
      if(index != -1) {
        this.storedCurrencies.splice(index, 1);
      }
    }

    // then save the list
    this.saveList();
  }

  /**
   * handles click event on the list item
   * @param event 
   */
  handleSearchChange(event: any) {
    var searchText = event.target.value;
    this.searchCurrency(searchText);
  }

  /**
   * saves the list in local storage
   */
  private saveList() {
    this.storageService.setList(this.storedCurrencies);
  }

  /**
   * gets the list of currencies
   */
  public getCurrencies() {
    let list: ICurrency[] = [];

    this.currencies.forEach((currency) => {
      if(currency.show) {
        if(this.storedCurrencies.find((curr, index) => {
          if(curr.code == currency.code) {
            return true;
          }
        })) {
          currency.selected = true;          
        }
        list.push(currency);
      }      
    });

    list.sort((a,b) => {
      if(a.selected && b.selected) { return a.name.localeCompare(b.name); }
      if(a.selected) { return -1; }
      else if(b.selected) { return 1; }

      return a.name.localeCompare(b.name);
    });

    // show toast if length is 0
    if(list.length == 0) {
      console.log("not found");
    }

    return list;
  }

  /**
   * searches for the currency based on code / name
   * @param value 
   */
  private searchCurrency(value) {
    this.currencies.forEach((curr, index) => {
      if(curr.code.toLowerCase().indexOf(value.toLowerCase()) != -1 || curr.name.toLowerCase().indexOf(value.toLowerCase()) != -1 || curr.selected) {
        curr.show = true;
      } else {
        curr.show = false;
      }
    });
  }

  /**
   * gets a particular currency object
   * @param currency 
   */
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
