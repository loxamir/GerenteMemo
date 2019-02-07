import { Injectable } from '@angular/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CloseService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) { }

  getClose(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createClose(close){
    return new Promise((resolve, reject)=>{
      close.docType = 'close';
      this.pouchdbService.createDoc(close).then(doc => {
        resolve({doc: doc, close: close});
      });
    });
  }
}
