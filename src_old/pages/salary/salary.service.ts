import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class SalaryService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}

  getSalary(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createSalary(viewData){
    return new Promise((resolve, reject)=>{
      let salary = Object.assign({}, viewData);
      salary.docType = 'salary';
      if (salary.contact){
        salary.contact_id = salary.contact._id;
      }
      delete salary.contact;
      if (salary.code != ''){
        console.log("sin code", salary.code);
        this.pouchdbService.createDoc(salary).then(doc => {
          resolve({doc: doc, salary: salary});
        });
      } else {
        this.configService.getSequence('salary').then((code) => {
          salary['code'] = code;
          this.pouchdbService.createDoc(salary).then(doc => {
            resolve({doc: doc, salary: salary});
          });
        });
      }
    });
  }

  updateSalary(viewData){
    let salary = Object.assign({}, viewData);
    salary.docType = 'salary';
    if (salary.contact){
      salary.contact_id = salary.contact._id;
    }
    delete salary.contact;
    return this.pouchdbService.updateDoc(salary);
  }

  deleteSalary(salary){
    return this.pouchdbService.deleteDoc(salary);
  }
}
