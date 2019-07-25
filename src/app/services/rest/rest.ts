import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};
declare var require: any;
import CryptoJS from 'crypto-js';
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

  changePassword(username, old_passowrd, new_password) {
    // return new Promise(resolve => {
      return new Promise(resolve => {
        this.http.get(
          this.databaseUrl+'/_users/org.couchdb.user:' + username,
          {
            // headers: new HttpHeaders().set('Authorization', "Basic YWRtaW46YWp2MTQzOXM=")
            headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":" + old_passowrd))
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
              headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":" + old_passowrd))
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
          resolve(userData.db_list);
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

  createPayLink(){
    return new Promise(resolve => {
      let url = "https://api.pagopar.com/api/comercios/1.1/iniciar-transaccion";
      // let method = "POST";
      let private_key = "29407eee2e04018c1e3e796d6c19ca2c";
      let public_key = "39ac921133884f1b86ab6f9fc0bcbf7f";
      let order_id = "";
      let amount = 1000;
      // var sha1 = require('sha1');
      // var request = require('request');
      let hash = CryptoJS.SHA1(private_key+"."+order_id+"."+amount);
      let token = CryptoJS.enc.Hex.stringify(hash);
      let today = new Date();
      //Last day of month
      let pay_date = (new Date(today.getFullYear(), today.getMonth() + 1, 0)).toJSON().replace("T", " ").split('.')[0];
      let orderData = {
        "token": token,
        "comprador": {
          "ruc": "7486241-3",
          "email": "loxamir@gmail.com",
          "ciudad": null,
          "nombre": "Marcelo Pickler",
          "telefono": "0984637042",
          "direccion": "",
          "documento": "7486241",
          "coordenadas": "",
          "razon_social": "Marcelo Pickler",
          "tipo_documento": "CI",
          "direccion_referencia": null
        },
        "public_key": public_key,
        "monto_total": amount,
        "tipo_pedido": "VENTA-COMERCIO",
        "compras_items": [
          {
            "ciudad": "1",
            "nombre": "Mensualidad Sistema Memo",
            "cantidad": 1,
            "categoria": "909",
            "public_key": public_key,
            "url_imagen": "https://app.sistemamemo.com/assets/images/logo.png",
            "descripcion": "Mensualidad Sistema Memo Julho/2019",
            "id_producto": 1,
            "precio_total": amount,
            "vendedor_telefono": "",
            "vendedor_direccion": "",
            "vendedor_direccion_referencia": "",
            "vendedor_direccion_coordenadas": ""
          }
        ],
        "fecha_maxima_pago": pay_date,
        "id_pedido_comercio": "1134",
        "descripcion_resumen": "",
      }
      console.log("orderData", orderData);
      this.http.post(
        url,
        orderData,
        {
          headers: new HttpHeaders({
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
          })
        }
      ).subscribe((userData: any) => {
        console.log("userData", userData);
      })
    })
  }
}
