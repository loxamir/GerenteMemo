import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class WorkService {

  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getWork(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializeWork(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }

  createWork(viewData){
    return new Promise((resolve, reject)=>{
      let work = this.serializeWork(viewData)
      this.pouchdbService.createDoc(work).then(doc => {
        resolve({doc: doc, work: work});
      });
    });
  }

  serializeWork(viewData){
    let work = Object.assign({}, viewData);
    work.docType = 'work';
    work.cost = parseFloat(work.cost);
    viewData.fields.forEach(field=>{
      if (field.type=='many2one' && work[field.name]){
        work[field.name+'_id'] = work[field.name]._id;
        delete work[field.name];
      }
    });
    // delete work.fields;
    work.activity_id = work.activity._id;
    work.activity_name = work.activity.name;
    delete work.activity;
    return work;
  }

  unserializeWork(doc_id){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
        let getList = [
          pouchData['activity_id']
        ];
        pouchData['fields'].forEach((field) => {
          if (field.type=='many2one'
          && getList.indexOf(pouchData[field.name+'_id'])==-1){
            getList.push(pouchData[field.name+'_id']);
          }
        });
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.activity = doc_dict[pouchData.activity_id] || {};
          pouchData['fields'].forEach((field) => {
            if (field.type=='many2one'){
              pouchData[field.name] = doc_dict[pouchData[field.name+'_id']] || {};
            }
          })
          resolve(pouchData);
        })
      }));
    });
  }

  updateWork(viewData){
    let work = this.serializeWork(viewData)
    return this.pouchdbService.updateDoc(work);
  }

  deleteWork(work){
    return this.pouchdbService.deleteDoc(work);
  }
}
