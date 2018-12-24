import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../../../services/pouchdb/pouchdb-service';

@Injectable()
export class TitlesService {
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getTitlesPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'title', keyword, page, "document", field
      ).then((titles: any[]) => {
        resolve(titles);
      });
    });
  }

  deleteTitle(title) {
    return this.pouchdbService.deleteDoc(title);
  }
}
