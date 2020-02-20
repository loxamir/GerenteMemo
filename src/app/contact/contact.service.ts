import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getContact(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id, true).then(((pouchData: any) => {
        let getList = [
          pouchData['address_id'],
        ];
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.address = doc_dict[pouchData.address_id] || {};
          if (pouchData._attachments && pouchData._attachments['profile.png']) {
            let profile = pouchData._attachments['profile.png'].data;
            pouchData.image = "data:image/png;base64," + profile;
          } else {
            pouchData.image = "./assets/images/sem_foto.jpg";
          }
          resolve(pouchData);
        })
      }))
    })
  }

  createContact(contact){
    return new Promise((resolve, reject)=>{
      contact.docType = 'contact';
      if (contact.code != ''){
        this.pouchdbService.createDoc(contact).then(doc => {
          resolve({doc: doc, contact: contact});
        });
      } else {
        this.pouchdbService.createDoc(contact).then(doc => {
          resolve({doc: doc, contact: contact});
        });
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
