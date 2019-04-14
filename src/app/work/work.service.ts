import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from '../services/rest/rest';

@Injectable()
export class WorkService {

  constructor(
    // public pouchdbService: PouchdbService,
    public restProvider: RestProvider,
  ) {}

  // getWork(doc_id): Promise<any> {
  //   return new Promise((resolve, reject)=>{
  //     this.unserializeWork(doc_id).then(viewData => {
  //       resolve(viewData);
  //     });
  //   });
  // }

  getWork(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.restProvider.getTask(doc_id).then((task) => {
        console.log("Task", task);
        let fieldList = [];
        Object.keys(task).forEach(field=>{
          // console.log("taskfield", field, task[field])
          task[field]['name'] = field;
          fieldList.push(task[field]);
        })
        console.log("fieldList", fieldList);
        resolve(fieldList);
      });
    });
  }

  getStartWork(process_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.restProvider.getStartTask(process_id).then((task) => {
        console.log("Task", task);
        let fieldList = [];
        Object.keys(task).forEach(field=>{
          // console.log("taskfield", field, task[field])
          task[field]['name'] = field;
          fieldList.push(task[field]);
        })
        console.log("fieldList", fieldList);
        resolve(fieldList);
      });
    });
  }


}
