import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class CheckService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}

  getCheck(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      return this.pouchdbService.getDoc(doc_id).then(pouchData=>{
        this.pouchdbService.getDoc(pouchData['bank_id']).then(bank => {
          pouchData['bank'] = bank;
          resolve(pouchData);
        });
      });
    });
  }


  createCheck(check){
    return new Promise((resolve, reject)=>{
      check.docType = 'check';
      if (check.bank){
        check.bank_id = check.bank._id;
      }
      delete check.bank;

      if (check.code != ''){
        this.pouchdbService.createDoc(check).then(doc => {
          resolve({doc: doc, check: check});
        });
      } else {
        // this.configService.getSequence('check').then((code) => {
        //   check['code'] = code;
          this.pouchdbService.createDoc(check).then(doc => {
            resolve({doc: doc, check: check});
          });
        // });
      }
    });

    // return this.pouchdbService.createDoc(check);
  }

  updateCheck(check){
    check.docType = 'check';
    if (check.bank){
      check.bank_id = check.bank._id;
    }
    delete check.bank;
    return this.pouchdbService.updateDoc(check);
  }

  deleteCheck(check){
    return this.pouchdbService.deleteDoc(check);
  }
}
