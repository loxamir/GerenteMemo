import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class InvoicesService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getInvoicesPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'invoice', keyword, page, "number"
      ).then((invoices: any[]) => {
        resolve(invoices);
      });
    });
  }

  deleteInvoice(invoice){
    return this.pouchdbService.deleteDoc(invoice);
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'invoice',
      keyword,
      page,
      "contact_name"
    ).then((invoices) => {
        resolve(invoices);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
