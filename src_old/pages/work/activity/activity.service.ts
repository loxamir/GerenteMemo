import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class ActivityService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getActivity(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createActivity(activity){
    activity.docType = 'activity';
    return this.pouchdbService.createDoc(activity);
  }

  updateActivity(activity){
    activity.docType = 'activity';
    return this.pouchdbService.updateDoc(activity);
  }

  deleteActivity(activity){
    return this.pouchdbService.deleteDoc(activity);
  }
}
