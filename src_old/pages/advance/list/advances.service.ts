import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class AdvancesService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getAdvancesPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'advance', keyword, page, "document", field
      ).then((advances: any[]) => {
        resolve(advances);
      });
    });
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'advance',
      keyword,
      page,
      "document"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  deleteAdvance(advance) {
    return this.pouchdbService.deleteDoc(advance);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
