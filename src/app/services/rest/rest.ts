import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};
// declare var Buffer: any;
/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({ providedIn: 'root' })
export class RestProvider {
  databaseUrl = 'https://database.sistemamemo.com';
  apiUrl = 'https://app.sistemamemo.com';

  constructor(public http: HttpClient) {
    // console.log('Hello RestProvider Provider');
  }

  getTasks() {
    return new Promise(resolve => {
      resolve([]);
      // this.http.get(this.apiUrl+'/engine-rest/task').subscribe(data => {
      //   console.log("tasks", data);
      //   resolve(data);
      // }, err => {
      //   console.log(err);
      // });
    });
  }

  getNews() {
    return new Promise(resolve => {
        this.http.get(this.apiUrl+'/engine-rest/task?unassigned=true').subscribe(data => {
        // console.log("tasks", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
  getDones() {
    return new Promise(resolve => {
        this.http.get(this.apiUrl+'/engine-rest/task').subscribe(data => {
        // console.log("tasks", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
  getMys() {
    return new Promise(resolve => {
        this.http.get(this.apiUrl+'/engine-rest/task?assignee=demo').subscribe(data => {
        // console.log("tasks", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }


  getTask(taskId) {
    return new Promise(resolve => {
      this.http.get(this.apiUrl+'/engine-rest/task/'+taskId+'/form-variables').subscribe(data => {
        // console.log("task", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
  updateTask(taskId, formVariables) {
    console.log("updateTask", formVariables);
    return new Promise(resolve => {
      this.http.post(this.apiUrl+'/engine-rest/task/'+taskId+'/resolve', formVariables).subscribe(data => {
        // console.log("task", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
  claimTask(taskId) {
    console.log("claimTask", taskId);
    return new Promise(resolve => {
      this.http.post(this.apiUrl+'/engine-rest/task/'+taskId+'/claim', {"userId": "demo"}).subscribe(data => {
        // console.log("task", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
  completeTask(taskId, formVariables) {
    console.log("updateTask", formVariables);
    return new Promise(resolve => {
      this.http.post(this.apiUrl+'/engine-rest/task/'+taskId+'/complete', formVariables).subscribe(data => {
        // console.log("task", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
  getStartTask(processId) {
    return new Promise(resolve => {
      this.http.get(this.apiUrl+'/engine-rest/process-definition/'+processId+'/form-variables').subscribe(data => {
        // console.log("start task start process", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
  startProcess(processId, formVariables) {
    return new Promise(resolve => {
      // console.log("startProcess", formVariables);
      this.http.post(this.apiUrl+'/engine-rest/process-definition/key/'+processId+'/start', formVariables).subscribe(data => {
        // console.log("started Process", data);
        // this.checkDbExist();
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
  getProcess() {
    return new Promise(resolve => {
      this.http.get(this.apiUrl+'/engine-rest/process-definition?latestVersion=true').subscribe(data => {
        // console.log("tasks", data);
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }


  checkDbExist(database) {
    return new Promise(resolve => {
        this.http.get(this.databaseUrl+'/'+database).subscribe(data => {
        // console.log("check exist", data);
        resolve(data);
      }, err => {
        resolve(err);
        // console.log(err);
      });
    });
  }

  getRucName(ruc) {
    return new Promise(resolve => {
        this.http.get(this.databaseUrl+'/ruc/'+ruc).subscribe(data => {
        // console.log("RUC NAME", data);
        resolve(data);
      }, err => {
        resolve(err);
        // console.log(err);
      });
    });
  }

  getDatabaseDoc(database, doc_id) {
    return new Promise(resolve => {
        this.http.get(this.databaseUrl+'/'+database+'/'+doc_id).subscribe(data => {
        // console.log("DOC NAME", data);
        resolve(data);
      }, err => {
        resolve(err);
        // console.log(err);
      });
    });
  }

  checkLogin(username, password) {
    return new Promise(resolve => {
      let loginData = {
        "name": username,
        "password":password
      }
      // console.log("loginData", loginData);
      this.http.post(this.databaseUrl+'/_session', loginData).subscribe(data => {
        // console.log("check login", data);
        resolve(data);
      }, err => {
        resolve(err);
        // console.log("erro", err);
      });
    });
  }

  changePassword(username, old_password, new_password) {
    // return new Promise(resolve => {
      return new Promise(resolve => {
        this.http.get(
          this.databaseUrl+'/_users/org.couchdb.user:' + username,
          {
            // headers: new HttpHeaders().set('Authorization', "Basic YWRtaW46YWp2MTQzOXM=")
            headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":" + old_password))
          }
        ).subscribe((userData: any) => {
          // console.log("userData", userData);
          // resolve(data);
          userData.password = new_password;
          // delete userData._rev;
          // let loginData = {
          //   "name": username,
          //   "password":password
          // }
          // console.log("loginData", loginData);
          this.http.put(
            this.databaseUrl+'_users/org.couchdb.user:'+ username,
            userData,
            {
              // headers: new HttpHeaders().set('Authorization', "Basic YWRtaW46YWp2MTQzOXM=")
              headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":" + old_password))
            }
          ).subscribe(data => {
            console.log("changed Password", data);
            resolve(data);
          }, err => {
            resolve(err);
            // console.log("erro", err);
          });
        }, err => {
          resolve(err);
          // console.log(err);
        });
      });
    // });
  }

  setUserLanguage(username, password, language){
    return new Promise(resolve => {
      this.http.get(
        this.databaseUrl+'/_users/org.couchdb.user:' + username,
        {
          headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":" + password))
        }
      ).subscribe((userData: any) => {
        userData.language = language;
        this.http.put(
          this.databaseUrl+'/_users/org.couchdb.user:'+ username,
          userData,
          {
            headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":" + password))
          }
        ).subscribe(data => {
          resolve(data);
        }, err => {
          resolve(err);
          console.log("change language error", err);
        });
      }, err => {
        console.log("change language get user error", err);
        resolve(err);
      });
    });
  }

  getUserDbList(username, password) {
    // return new Promise(resolve => {
      return new Promise(resolve => {
        this.http.get(
          this.databaseUrl+'/_users/org.couchdb.user:' + username,
          {
            // headers: new HttpHeaders().set('Authorization', "Basic YWRtaW46YWp2MTQzOXM=")
            headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":" + password))
          }
        ).subscribe((userData: any) => {
          // console.log("userData", userData);
          resolve({db_list: userData.db_list, userData});
          // resolve(data);
          // userData.password = new_password;
          // delete userData._rev;
          // let loginData = {
          //   "name": username,
          //   "password":password
          // }
          // console.log("loginData", loginData);
          // this.http.put(
          //   this.databaseUrl+'/_users/org.couchdb.user:'+ username,
          //   userData,
          //   {
          //     // headers: new HttpHeaders().set('Authorization', "Basic YWRtaW46YWp2MTQzOXM=")
          //     headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":" + old_passowrd))
          //   }
          // ).subscribe(data => {
          //   console.log("changed Password", data);
          //   resolve(data);
          // }, err => {
          //   resolve(err);
          //   // console.log("erro", err);
          // });
        }, err => {
          resolve(err);
          // console.log(err);
        });
      });
    // });
  }
  // addUser(data) {
  //   return new Promise((resolve, reject) => {
  //     this.http.post(this.databaseUrl+'/users', JSON.stringify(data))
  //       .subscribe(res => {
  //         resolve(res);
  //       }, (err) => {
  //         reject(err);
  //       });
  //   });
  // }

}
