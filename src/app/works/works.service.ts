import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from '../services/rest/rest';

@Injectable()
export class WorksService {
  constructor(
    // public pouchdbService: PouchdbService,
    public restProvider: RestProvider,
  ) {}

  // getWorksPage(keyword, page){
  //   return new Promise(resolve => {
  //     this.pouchdbService.searchDocTypeData(
  //       'work',
  //       keyword,
  //       page,
  //       "activity_name"
  //     ).then((works: any[]) => {
  //       resolve(works);
  //     });
  //   });
  // }

  getWorksPage(keyword, page){
  return new Promise(resolve => {
    this.restProvider.getMys().then((tasks: any[]) => {
      console.log("got tasks service", tasks);
      resolve(tasks);
    });
  });
}

  // searchItems(keyword, page) {
  //   return new Promise(resolve => {
  //   this.pouchdbService.searchDocs(
  //     'work', keyword, page, "activity_name"
  //   ).then((sales) => {
  //       resolve(sales);
  //     })
  //   })
  // }
  //
  // deleteWork(work){
  //   return this.pouchdbService.deleteDoc(work);
  // }
  //
  // handleChange(list, change){
  //   this.pouchdbService.localHandleChangeData(list, change)
  // }
}
