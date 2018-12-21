import { Injectable } from "@angular/core";
// import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class ProjectsService {
  constructor(
    // public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getProjects(keyword, page){
    return this.pouchdbService.searchDocTypeData('project', keyword, page);
    // return this.pouchdbService.searchDocTypePage('project');
  }

  deleteProject(project) {
    return this.pouchdbService.deleteDoc(project);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
