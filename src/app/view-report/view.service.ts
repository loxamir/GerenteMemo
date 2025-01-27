import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable({
  providedIn: 'root'
})
export class ViewService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  // getView(keyword){
  //   return this.pouchdbService.searchDocTypePage('warehouse');
  // }

  deleteView(View) {
    return this.pouchdbService.deleteDoc(View);
  }

  // getView(keyword){
  //   return new Promise((resolve, reject)=>{
  //     ////console.log("getPlanned");
  //     this.pouchdbService.searchDocTypePage('warehouse').then((view: any[]) => {
  //       let promise_ids = [];
  //       console.log("acciybts", view)
  //       view.forEach(warehouse => {
  //         console.log("warehouse", warehouse);
  //         promise_ids.push(this.getViewBalance(warehouse._id));
  //       });
  //       Promise.all(promise_ids).then(balances => {
  //         for(let i=0;i<balances.length;i++){
  //           view[i].balance = balances[i];
  //         }
  //         console.log("view", view);
  //         resolve(view);
  //       });
  //     });
  //   });
  // }


  getView(keyword, reportView, level, startkey, endkey){
    return new Promise((resolve, reject)=>{
      // console.log("level, startkey, endkey", level, startkey, endkey);
      this.pouchdbService.getView(reportView, level, startkey, endkey).then((view: any[]) => {
        // console.log("viewww", view);
        // resolve(view);
        let promise_ids = []
        view.forEach(async item => {
          item.doc = await this.pouchdbService.getDoc(item.key[item.key.length - 1]);
        })
        resolve(view);
      });
    });
  }

  // getViewBalance(warehouse_id){
  //   return new Promise((resolve, reject)=>{
  //     this.pouchdbService.searchDocTypeData('cash-move', '', false).then((planneds: any[]) => {
  //       console.log("planneds", planneds);
  //       //resolve(planneds);
  //       // let promise_ids = []
  //       let balance = 0;
  //       planneds.forEach(item => {
  //         ////console.log("iitem", item);
  //         if (item.warehouseFrom_id == warehouse_id){
  //           balance -= item.amount;
  //         } else if (item.warehouseTo_id == warehouse_id){
  //           balance += item.amount;
  //         }
  //       })
  //       console.log("balance", balance);
  //       resolve(balance);view
  //       // Promise.all(promise_ids).then(contacts => {
  //       //   for(let i=0;i<planneds.length;i++){
  //       //     planneds[i].contact = contacts[i];
  //       //   }
  //       //   ////console.log("planneds", planneds);
  //       //   planneds.forEach(item => {
  //       //     item.date = new Date(item.date);
  //       //   });
  //       //   let result = this.groupByName(planneds, 'contact_id', 'amount');
  //       //   console.log("result", result);
  //       //   resolve(result);
  //       // })
  //     });
  //   });
  // }
}
