import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class WarehousesService {
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  // getWarehouses(keyword){
  //   return this.pouchdbService.searchDocTypePage('warehouse');
  // }

  deleteWarehouse(Warehouse) {
    return this.pouchdbService.deleteDoc(Warehouse);
  }

  // getWarehouses(keyword, page){
  //   return new Promise((resolve, reject)=>{
  //     ////console.log("getPlanned");
  //     this.pouchdbService.searchDocTypePage('warehouse', keyword, page).then((warehouses: any[]) => {
  //       let promise_ids = [];
  //       resolve(warehouses);
  //       // console.log("acciybts", warehouses)
  //       // // warehouses.forEach(warehouse => {
  //       // //   console.log("warehouse", warehouse);
  //       // //   promise_ids.push(this.getWarehouseBalance(warehouse._id));
  //       // // });
  //       // Promise.all(promise_ids).then(balances => {
  //       //   for(let i=0;i<balances.length;i++){
  //       //     warehouses[i].balance = balances[i];
  //       //   }
  //       //   console.log("warehouses", warehouses);
  //       // });
  //     });
  //   });
  // }

  getWarehouses(keyword, page, select){
    return new Promise((resolve, reject)=>{
      ////console.log("getPlanned");
      // let payableList = [];
      this.pouchdbService.getView(
        'stock/Depositos', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        console.log("Caixas", planneds);
        let warehouses = [];
        this.pouchdbService.searchDocTypeData('warehouse', keyword).then((warehouseList: any[]) => {
          console.log("warehouseList", warehouseList);
          warehouseList.forEach(warehouse=>{
            warehouse.balance = 0;
            // if (warehouse._id == 'warehouse.my'){
            if (warehouse._id.split('.')[1] == 'physical'){
              // planneds.filter(x => x._id=='account.cash.USD')
              // console.log("index", planneds.filter(x => x.key[0]==warehouse._id)[0]);
              let warehouseReport = planneds.filter(x => x.key[0]==warehouse._id)[0]
              warehouse.balance = warehouseReport && warehouseReport.value || 0;
              console.log("identificado", warehouse);
              warehouses.push(warehouse);
            } else if (select){
              let warehouseReport = planneds.filter(x => x.key[0]==warehouse._id)[0]
              warehouse.balance = warehouseReport && warehouseReport.value || 0;
              console.log("identificado", warehouse);
              warehouses.push(warehouse);
            }
          })
          resolve(warehouses);
        });
      });
    });
  }


  // getWarehouses(keyword, level, startkey, endkey){
  //   return new Promise((resolve, reject)=>{
  //     // console.log("level, startkey, endkey", level, startkey, endkey);
  //     this.pouchdbService.getView('stock/Depositos', level, startkey, endkey).then((warehouses: any[]) => {
  //       let promise_ids = []
  //       warehouses.forEach(item => {
  //         // console.log("item.key[0]", item.key[item.key.length - 1]);
  //         promise_ids.push(this.pouchdbService.getDoc(item.key[item.key.length - 1]));
  //       })
  //       Promise.all(promise_ids).then(values => {
  //         // console.log("values", values);
  //         for(let i=0;i<values.length;i++){
  //           warehouses[i].doc = values[i];
  //         }
  //         // console.log("warehouses", warehouses);
  //         resolve(warehouses);
  //       })
  //     });
  //   });
  // }

  // getWarehouseBalance(warehouse_id){
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
  //       resolve(balance);
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
