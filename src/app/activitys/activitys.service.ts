import { Injectable } from "@angular/core";
// import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class ActivitysService {
  // data: any;
  // options: any = {limit : 15, startkey: "activity.z", include_docs : true, descending : true, endkey: "activity."};
  constructor(
    // public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getActivitysPage(keyword, page, field=''){
    return new Promise(resolve => {
      console.log("field", field);
      this.pouchdbService.searchDocTypeData(
        'activity', keyword, page, "document", field
      ).then((activitys: any[]) => {
        resolve(activitys);
      });
    });
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'activity',
      keyword,
      page,
      "note"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  deleteActivity(activity) {
    return this.pouchdbService.deleteDoc(activity);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
