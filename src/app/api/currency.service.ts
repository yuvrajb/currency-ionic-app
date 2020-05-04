import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import all from '../../assets/currencies/all.json';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  baseUrl = environment.baseUrl;
  apiKey = environment.apiKey;

  constructor() { }

  public getCurrencyList() {

  }
}
