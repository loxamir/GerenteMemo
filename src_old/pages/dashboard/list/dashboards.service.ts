import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class DashboardsService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getDashboardsPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'dashboard', keyword, page, "document", field
      ).then((dashboards: any[]) => {
        resolve(dashboards);
      });
    });
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'dashboard',
      keyword,
      page,
      "document"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  deleteDashboard(dashboard) {
    return this.pouchdbService.deleteDoc(dashboard);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
