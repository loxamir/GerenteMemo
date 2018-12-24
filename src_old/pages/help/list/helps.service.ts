import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class HelpsService {
  data: any;
  options: any = {limit : 15, startkey: "help.z", include_docs : true, descending : true, endkey: "help."};
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getHelpsPage(keyword, page, field=''){
    return new Promise(resolve => {
      // this.pouchdbService.searchDocTypePage('help', this.options).then((helps: any[]) => {
      // this.pouchdbService.searchDocTypePage('help', keyword, page).then((helps: any[]) => {
      console.log("field", field);
      this.pouchdbService.searchDocTypeData('help', keyword, page, "document", field).then((helps: any[]) => {
        // console.log("search", keyword, JSON.stringify(helps));
        // if (helps && helps.length > 0) {
        //   this.options.startkey = helps[helps.length - 1]._id;
        //   this.options.skip = 1;
        // }
        resolve(helps);
      });
    });
  }

  deleteHelp(help) {
    return this.pouchdbService.deleteDoc(help);
  }
}
