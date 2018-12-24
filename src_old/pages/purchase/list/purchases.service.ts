import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class PurchasesService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getPurchases(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'purchase', keyword, page, "contact_name"
      ).then((purchases: any[]) => {
        resolve(purchases);
      });
    });
  }

  deletePurchase(purchase){
    return this.pouchdbService.deleteDoc(purchase);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'purchase',
      keyword,
      page,
      "contact_name"
    ).then((purchases) => {
        resolve(purchases);
      })
    })
  }

}
