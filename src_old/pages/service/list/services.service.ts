import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class ServicesService {
  data: any;
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getServicesPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'service', keyword, page, "contact_name"
      ).then((services: any[]) => {
        resolve(services);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  deleteService(service){
    return this.pouchdbService.deleteDoc(service);
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'service',
      keyword,
      page,
      "contact_name"
    ).then((services) => {
        resolve(services);
      })
    })
  }

}
