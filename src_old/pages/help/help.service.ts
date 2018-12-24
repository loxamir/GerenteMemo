import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class HelpService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getHelp(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createHelp(help){
    help.docType = 'help';
    return this.pouchdbService.createDoc(help);
  }

  updateHelp(help){
    help.docType = 'help';
    return this.pouchdbService.updateDoc(help);
  }

  deleteHelp(help){
    return this.pouchdbService.deleteDoc(help);
  }
}
