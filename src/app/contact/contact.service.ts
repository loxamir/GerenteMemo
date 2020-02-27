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
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id, true).then(((pouchData: any) => {
        let getList = [
          // pouchData['address_id'],
        ];
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          resolve(pouchData);
        })
      }))
    })
  }

  createContact(viewData) {
    return new Promise((resolve, reject) => {
      let contact = Object.assign({}, viewData);
      contact.docType = 'contact';
      if (contact.code != '') {
        this.pouchdbService.createDoc(contact).then(doc => {
          resolve({ doc: doc, contact: contact });
        });
      } else {
        this.pouchdbService.createDoc(contact).then(doc => {
          resolve({ doc: doc, contact: contact });
        });
      }
    });
  }

  updateContact(viewData) {
    let contact = Object.assign({}, viewData);
    contact.docType = 'contact';
    return this.pouchdbService.updateDoc(contact);
  }

  deleteContact(contact){
    return this.pouchdbService.deleteDoc(contact);
  }
}
