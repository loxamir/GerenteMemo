import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class CurrencyService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getCurrency(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createCurrency(currency){
    currency.docType = 'currency';
    return this.pouchdbService.createDoc(currency);
  }

  updateCurrency(currency){
    currency.docType = 'currency';
    return this.pouchdbService.updateDoc(currency);
  }

  getCurrencyList(keyword){
    return this.pouchdbService.searchDocTypeData('currency');
  }

  deleteCurrency(currency) {
    return this.pouchdbService.deleteDoc(currency);
  }
}
