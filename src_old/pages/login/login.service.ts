import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
// import { HttpClient } from '@angular/common/http';
// import { Storage } from '@ionic/storage';
// import PouchDB from 'pouchdb';
// import PouchDBFind from 'pouchdb-find';
// import PouchdbUpsert from 'pouchdb-upsert';
// import { Http } from '@angular/http';
import { RestProvider } from '../services/rest/rest';

var server = "couchdb.sistema.social";
var port = "5984";

@Injectable()
export class LoginService {

  db: any;
  dbUsers: any;
  remote: string;

  constructor(
    // public http: Http,
    // public storage: Storage,
    public restProvider: RestProvider,
  ) { }

  createLogin(datas){
    return new Promise((resolve, reject)=>{
      // console.log("datas", datas);
      let body = {variables:{
        "name": {"value":datas.name, "type": "String"},
        "mobile": {"value":datas.mobile, "type": "String"},
        "email": {"value":datas.email, "type": "String"},
        "user": {"value":datas.user.toLowerCase(), "type": "String"},
        "password": {"value":datas.password, "type": "String"},
      }};
      // console.log("variables", variables);
      this.restProvider.startProcess("Process_1", body).then((data:any)=>{
        // console.log("DATA startProcess", data);
        resolve(data);
      })
    });
  }

  checkLogin(username, password){
    return new Promise((resolve, reject)=>{
      // console.log("variables", variables);
      this.restProvider.checkLogin(username.toLowerCase(), password).then((data:any)=>{
        // console.log("DATA startProcess", data);
        resolve(data);
      })
    });
  }
}
