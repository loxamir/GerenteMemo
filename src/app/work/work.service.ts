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
    // work.cost = parseFloat(work.cost);
    viewData.fields.forEach(field=>{
      if (field.type=='many2one' && work[field.name]){
        work[field.name+'_id'] = work[field.name]._id;
        work[field.name+'_name'] = work[field.name].name;
        delete work[field.name];
      } else if (field.type=='tab' || field.type=='list'){
        // field.activity_id
        work[field.name].forEach((item, index)=>{
          work[field.name][index]['activity_id'] = field.activity._id || work[field.name][index]['activity_id'];
          // work[field.name+'_name'] = work[field.name].name;
          delete work[field.name][index]['activity'];
          delete work[field.name][index]['fields'];
          console.log("activity", work[field.name][index]);
        })
      }
    });
    console.log("work", work);
    // delete work.fields;
    // work.summary = work.activity.summary;
    work.activity_id = work.activity._id;
    work.activity_name = work.activity.name;
    delete work.activity;
    delete work.fields;
    return work;
  }

  unserializeWork(doc_id){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then((async (pouchData: any) => {
        let getList = [];
        let activity = await this.pouchdbService.getDoc(pouchData['activity_id']);

        pouchData['fields'] = activity['fields'];
        pouchData['fields'].forEach((field) => {
          if (field.type=='many2one'
          && getList.indexOf(pouchData[field.name+'_id'])==-1){
            getList.push(pouchData[field.name+'_id']);
          // }
          } else if (field.typ == 'tab'){
            getList.push(pouchData[field.name]['activity_id']);
          }
        });
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.activity = activity || {};
          pouchData['fields'].forEach((field) => {
            if (field.type=='many2one'){
              pouchData[field.name] = doc_dict[pouchData[field.name+'_id']] || {};
            }
            else if (field.type=='tab' || field.type=='list'){
              pouchData[field.name]['activity'] = doc_dict[pouchData[field.name]['activity_id']] || {};
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
