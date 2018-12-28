import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}

  getDashboard(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createDashboard(dashboard){
    return new Promise((resolve, reject)=>{
      dashboard.docType = 'dashboard';
      if (dashboard.code != ''){
        console.log("sin code", dashboard.code);
        this.pouchdbService.createDoc(dashboard).then(doc => {
          resolve({doc: doc, dashboard: dashboard});
        });
      } else {
        this.configService.getSequence('dashboard').then((code) => {
          dashboard['code'] = code;
          this.pouchdbService.createDoc(dashboard).then(doc => {
            resolve({doc: doc, dashboard: dashboard});
          });
        });
      }
    });
  }

  updateDashboard(dashboard){
    dashboard.docType = 'dashboard';
    return this.pouchdbService.updateDoc(dashboard);
  }

  deleteDashboard(dashboard){
    return this.pouchdbService.deleteDoc(dashboard);
  }
}
