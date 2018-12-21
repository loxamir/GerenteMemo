import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../../../../services/pouchdb/pouchdb-service';

@Injectable()
export class TitleService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getTitle(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createTitle(title){
    title.docType = 'title';
    return this.pouchdbService.createDoc(title);
  }

  updateTitle(title){
    title.docType = 'title';
    return this.pouchdbService.updateDoc(title);
  }

  deleteTitle(title){
    return this.pouchdbService.deleteDoc(title);
  }
}
