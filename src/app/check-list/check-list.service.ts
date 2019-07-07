import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable({
  providedIn: 'root'
})
export class CheckListService {

  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getChecks(keyword, page, field=null, filter=null){
    return new Promise((resolve, reject)=>{
      if (field){
        this.pouchdbService.searchDocTypeDataField(
          'check', keyword, page, field, filter, "maturity_date"
        ).then((accounts: any[]) => {
          resolve(accounts);
        });
      } else {
        this.pouchdbService.searchDocTypeData(
          'check', keyword, page
        ).then((accounts: any[]) => {
          resolve(accounts);
        });
      }
    });
  }

  deleteCheck(check) {
    return this.pouchdbService.deleteDoc(check);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}
