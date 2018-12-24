import { Injectable } from "@angular/core";
// import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class ChecksService {
  constructor(
    // public http: Http,
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
