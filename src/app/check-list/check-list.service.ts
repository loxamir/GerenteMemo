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

  getChecks(keyword, page){
    return this.pouchdbService.searchDocTypeData('check', keyword, page);
    // return this.pouchdbService.searchDocTypePage('check');
  }

  deleteCheck(check) {
    return this.pouchdbService.deleteDoc(check);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}
