import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class ContactsService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getContactsPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'contact', keyword, page, "document", field
      ).then((contacts: any[]) => {
        resolve(contacts);
      });
    });
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'contact',
      keyword,
      page,
      "document"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  deleteContact(contact) {
    return this.pouchdbService.deleteDoc(contact);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
