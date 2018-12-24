import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class AccountCategoryService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getAccountCategory(doc_id): Promise<any> {
    // return this.pouchdbService.getDoc(doc_id);
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then((category: any)=>{
        this.pouchdbService.getDoc(category.title_id).then(title=>{
          category.title = title || {};
          resolve(category);
        });
      });
    });
  }

  createAccountCategory(accountCategory){
    accountCategory.docType = 'accountCategory';
    accountCategory.title_id = accountCategory.title._id;
    delete accountCategory.title;
    return this.pouchdbService.createDoc(accountCategory);
  }

  updateAccountCategory(accountCategory){
    accountCategory.docType = 'accountCategory';
    accountCategory.title_id = accountCategory.title._id;
    delete accountCategory.title;
    return this.pouchdbService.updateDoc(accountCategory);
  }

  deleteAccountCategory(accountCategory){
    return this.pouchdbService.deleteDoc(accountCategory);
  }
}
