import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class ProjectService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}

  getProject(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      return this.pouchdbService.getDoc(doc_id).then(pouchData=>{
        this.pouchdbService.getDoc(pouchData['project_id']).then(project => {
          pouchData['project'] = project;
          resolve(pouchData);
        });
      });
    });
  }


  createProject(project){
    return new Promise((resolve, reject)=>{
      project.docType = 'project';
      if (project.project){
        project.project_id = project.project._id;
      }
      delete project.project;

      if (project.code != ''){
        this.pouchdbService.createDoc(project).then(doc => {
          resolve({doc: doc, project: project});
        });
      } else {
        // this.configService.getSequence('project').then((code) => {
        //   project['code'] = code;
          this.pouchdbService.createDoc(project).then(doc => {
            resolve({doc: doc, project: project});
          });
        // });
      }
    });

    // return this.pouchdbService.createDoc(project);
  }

  updateProject(project){
    project.docType = 'project';
    if (project.project){
      project.project_id = project.project._id;
    }
    delete project.project;
    return this.pouchdbService.updateDoc(project);
  }

  deleteProject(project){
    return this.pouchdbService.deleteDoc(project);
  }
}
