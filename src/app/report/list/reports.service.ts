import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class ReportsService {
  data: any;
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getReports(keyword){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeAllData('report', keyword, this.data).then((reports: any[]) => {
        let promise_ids = [];
        reports.forEach(item => {
          if (item.contact_id){
            promise_ids.push(this.pouchdbService.getDoc(item.contact_id));
          } else {
            promise_ids.push(false);
          }
        });
        Promise.all(promise_ids).then(contacts => {
          for(let i=0;i<reports.length;i++){
            reports[i].contact = contacts[i];
          }
          resolve(reports);
        });
      });
    });
  }

  getReportsPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeAllData('report', keyword, page).then((reports: any[]) => {
        let promise_ids = [];
        reports.forEach(item => {
          if (item.contact_id){
            promise_ids.push(this.pouchdbService.getDoc(item.contact_id));
          } else {
            promise_ids.push(false);
          }
        });
        Promise.all(promise_ids).then(contacts => {
          for(let i=0;i<reports.length;i++){
            reports[i].contact = contacts[i];
          }
          resolve(reports);
        });
      });
    });
  }


  deleteReport(report){
    //if (report.state == 'QUOTATION'){
      return this.pouchdbService.deleteDoc(report);
    //}
  }

}
