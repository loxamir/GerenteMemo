import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class WorksService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getWorksPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'work', keyword, page, "contact_name"
      ).then((works: any[]) => {
        resolve(works);
      });
    });
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'work', keyword, page, "contact_name"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  deleteWork(work){
    return this.pouchdbService.deleteDoc(work);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
