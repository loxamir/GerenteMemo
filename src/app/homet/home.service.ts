import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class HomeService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getHome(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createHome(home){
    home.docType = 'home';
    return this.pouchdbService.createDoc(home);
  }

  updateHome(home){
    home.docType = 'home';
    return this.pouchdbService.updateDoc(home);
  }

  deleteHome(home){
    return this.pouchdbService.deleteDoc(home);
  }
}
