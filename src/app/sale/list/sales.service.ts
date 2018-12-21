import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class SalesService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getSalesPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'sale',
        keyword,
        page,
        "contact_name"
      ).then((sales: any[]) => {
        resolve(sales);
      });
    });
  }

  deleteSale(sale){
    return this.pouchdbService.deleteDoc(sale);
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'sale',
      keyword,
      page,
      "contact_name"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}
