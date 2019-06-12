import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getCheck(doc_id): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let pouchData = await this.pouchdbService.getDoc(doc_id);
      let docList: any = await this.pouchdbService.getList([
        pouchData['bank_id'],
        pouchData['account_id'],
        pouchData['contact_id'],
      ]);
      let docDict = {}
      docList.forEach(item=>{
        docDict[item.id] = item.doc;
      })
      pouchData['bank'] = docDict[pouchData['bank_id']];
      pouchData['account'] = docDict[pouchData['account_id']];
      pouchData['contact'] = docDict[pouchData['contact_id']];
      resolve(pouchData);
    });
  }

  createCheck(viewData){
    let check = Object.assign({}, viewData);
    return new Promise((resolve, reject)=>{
      check.docType = 'check';
      if (check.bank){
        check.bank_id = check.bank._id;
      }
      delete check.bank;
      if (JSON.stringify(check.contact)!='{}'){
        check.contact_id = check.contact._id;
        check.contact_name = check.contact_name;
      }
      delete check.contact;
      check.account_id = check.account && check.account._id || check.account_id || '';
      delete check.account;
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

  updateCheck(viewData){
    let check = Object.assign({}, viewData);
    check.docType = 'check';
    if (check.bank){
      check.bank_id = check.bank._id;
    }
    delete check.bank;
    if (JSON.stringify(check.contact)!='{}'){
      check.contact_id = check.contact._id;
      check.contact_name = check.contact.name;
    }
    delete check.contact;
    check.account_id = check.account && check.account._id || check.account_id || '';
    delete check.account;
    return this.pouchdbService.updateDoc(check);
  }
}
