import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class ReceiptsService {
  data: any;
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getReceiptsPage(keyword, page){
    return new Promise(resolve => {
      // this.pouchdbService.searchDocTypeData('receipt', keyword, this.data).then((receipts: any[]) => {
      this.pouchdbService.searchDocTypeData(
        'receipt', keyword, page, "contact_name"
      ).then((receipts: any[]) => {
        resolve(receipts);
        // let promise_ids = [];
        // receipts.forEach(item => {
        //   if (item.contact_id){
        //     promise_ids.push(this.pouchdbService.getDoc(item.contact_id));
        //   } else {
        //     promise_ids.push(this.pouchdbService.getDoc("contact.unknown"));
        //   }
        // });
        // Promise.all(promise_ids).then(contacts => {
        //   for(let i=0;i<receipts.length;i++){
        //     receipts[i].contact = contacts[i];
        //   }
        //   resolve(receipts);
        // });
      });
    });
  }


  deleteReceipt(receipt){
    return this.pouchdbService.deleteDoc(receipt);
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'receipt',
      keyword,
      page,
      "contact_name"
    ).then((receipts) => {
        resolve(receipts);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}
