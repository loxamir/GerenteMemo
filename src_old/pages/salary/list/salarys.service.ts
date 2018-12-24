import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class SalarysService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getSalarysPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'salary', keyword, page, "document", field
      ).then((salarys: any[]) => {
        resolve(salarys);
      });
    });
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'salary',
      keyword,
      page,
      "document"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  deleteSalary(salary) {
    return this.pouchdbService.deleteDoc(salary);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
