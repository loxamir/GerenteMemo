import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}

  getContact(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createContact(contact){
    return new Promise((resolve, reject)=>{
      contact.docType = 'contact';
      if (contact.code != ''){
        // console.log("sin code", contact.code);
        this.pouchdbService.createDoc(contact).then(doc => {
          resolve({doc: doc, contact: contact});
        });
      } else {
        // this.configService.getSequence('contact').then((code) => {
          // contact['code'] = code;
          this.pouchdbService.createDoc(contact).then(doc => {
            resolve({doc: doc, contact: contact});
          });
        // });
      }
    });
  }

  updateContact(contact){
    contact.docType = 'contact';
    return this.pouchdbService.updateDoc(contact);
  }

  deleteContact(contact){
    return this.pouchdbService.deleteDoc(contact);
  }
}
