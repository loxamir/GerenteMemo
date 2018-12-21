import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AdvanceService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}

  getAdvance(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createAdvance(viewData){
    return new Promise((resolve, reject)=>{
      let advance = Object.assign({}, viewData);
      advance.docType = 'advance';
      if (advance.contact){
        advance.contact_id = advance.contact._id;
      }
      delete advance.contact;
      if (advance.code != ''){
        console.log("sin code", advance.code);
        this.pouchdbService.createDoc(advance).then(doc => {
          resolve({doc: doc, advance: advance});
        });
      } else {
        this.configService.getSequence('advance').then((code) => {
          advance['code'] = code;
          this.pouchdbService.createDoc(advance).then(doc => {
            resolve({doc: doc, advance: advance});
          });
        });
      }
    });
  }

  updateAdvance(viewData){
    let advance = Object.assign({}, viewData);
    advance.docType = 'advance';
    if (advance.contact){
      advance.contact_id = advance.contact._id;
    }
    delete advance.contact;
    return this.pouchdbService.updateDoc(advance);
  }

  deleteAdvance(advance){
    return this.pouchdbService.deleteDoc(advance);
  }
}
