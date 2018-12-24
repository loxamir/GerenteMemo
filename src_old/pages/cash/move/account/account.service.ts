import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class AccountService {

  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getAccount(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then((account: any)=>{
        this.pouchdbService.getDoc(account.category_id).then(category=>{
          account.category = category || {};
          resolve(account);
        });
      });
    });
  }

  createAccount(viewData){
    //console.log("try create", account);
    let account = Object.assign({}, viewData);
    account.docType = 'account';
    account.category_id = account.category && account.category._id || account.category_id;
    delete account.category;
    return this.pouchdbService.createDoc(account);
  }

  updateAccount(viewData){
    let account = Object.assign({}, viewData);
    account.docType = 'account';
    account.category_id = account.category && account.category._id || account.category_id;
    delete account.category;
    return this.pouchdbService.updateDoc(account);
  }

  deleteAccount(account){
    return this.pouchdbService.deleteDoc(account);
  }
}
