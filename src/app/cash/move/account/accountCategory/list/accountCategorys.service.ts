import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../../../../services/pouchdb/pouchdb-service';

@Injectable()
export class AccountCategorysService {
  data: any;
  options: any = {limit : 15, startkey: "accountCategory.z", include_docs : true, descending : true, endkey: "accountCategory."};
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getAccountCategorysPage(keyword, page, field=''){
    return new Promise(resolve => {
      // this.pouchdbService.searchDocTypePage('accountCategory', this.options).then((accountCategorys: any[]) => {
      // this.pouchdbService.searchDocTypePage('accountCategory', keyword, page).then((accountCategorys: any[]) => {
      console.log("field", field);
      this.pouchdbService.searchDocTypeData('accountCategory', keyword, page, "document", field).then((accountCategorys: any[]) => {
        // console.log("search", keyword, JSON.stringify(accountCategorys));
        // if (accountCategorys && accountCategorys.length > 0) {
        //   this.options.startkey = accountCategorys[accountCategorys.length - 1]._id;
        //   this.options.skip = 1;
        // }
        resolve(accountCategorys);
      });
    });
  }

  deleteAccountCategory(accountCategory) {
    return this.pouchdbService.deleteDoc(accountCategory);
  }
}
