import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';
import { ConfigService } from '../../config/config.service';
import { StockMoveService } from '../stock-move.service';
import { ProductService } from '../../product/product.service';

@Injectable()
export class WarehouseService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    public stockMoveService: StockMoveService,
    public productService: ProductService,
  ) {}

  // getWarehouse(doc_id): Promise<any> {
  //   return new Promise((resolve, reject)=>{
  //     this.pouchdbService.getDoc(doc_id).then((warehouse => {
  //       this.pouchdbService.getRelated(
  //       "warehouse-move", "warehouse_id", doc_id).then((moves) => {
  //         warehouse['moves'] = moves;
  //         this.pouchdbService.getRelated(
  //         "check", "warehouse_id", doc_id).then((checks) => {
  //           warehouse['checks'] = [];
  //           checks.forEach(check => {
  //             if (check.state != 'PAID'){
  //               warehouse['checks'].push(check);
  //             }
  //           });
  //           //warehouse['checks'] = checks;
  //           resolve(warehouse);
  //         });
  //         //resolve(warehouse);
  //       });
  //     }));
  //   });
  // }


  getWarehouse(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      ////console.log("getPlanned");
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Depositos', 2,
        [doc_id, '0'],
        [doc_id, 'z']
      ).then((planneds: any[]) => {
        console.log("Depositos", planneds);
        let promise_ids = [];
        let pts = [];
        let balance = 0;
        planneds.forEach(item => {
          // if (item.value != 0){
            pts.push(item);
            console.log("ites", item);
            promise_ids.push(this.productService.getProduct(item.key[1]));
            balance += parseFloat(item.value);
          // }
        })
        promise_ids.push(this.pouchdbService.getDoc(doc_id));
        Promise.all(promise_ids).then(stockMoves => {
          // resolve(pts);
          console.log("stockMoves", stockMoves);
          console.log("pts", pts);
          // let warehouse = ;
          let warehouse = Object.assign({}, stockMoves[stockMoves.length-1]);
          warehouse.moves = [];
          warehouse.balance = balance;
          warehouse.warehouse = stockMoves[stockMoves.length-1];
          warehouse.name
          for(let i=0;i<pts.length;i++){
            stockMoves[i].stock = pts[i].value;
            warehouse.moves.unshift(stockMoves[i]);
            console.log(stockMoves[i].value);
          }
          console.log("PTS2", warehouse);
          // let receivables = pts.filter(word => word['contact_name'] && word['contact_name'].toString().search(new RegExp(keyword, "i")) != -1);
          resolve(warehouse);
        })
      });
    });
  }

  // createWarehouse(warehouse){
  //   warehouse.docType = 'warehouse';
  //   delete warehouse.moves;
  //   delete warehouse.warehouse;
  //   return this.pouchdbService.createDoc(warehouse);
  // }

  createWarehouse(warehouse){
    warehouse.docType = 'warehouse';
    delete warehouse.moves;
    delete warehouse.warehouse;
    return new Promise((resolve, reject)=>{
      if (warehouse.code != ''){
        this.pouchdbService.createDoc(warehouse).then(doc => {
          if (warehouse.type == 'physical'){
            warehouse._id = "warehouse.physical."+warehouse.code;
          }
          resolve({doc: doc, warehouse: warehouse});
        });
      } else {
        this.configService.getSequence('warehouse').then((code) => {
          warehouse['code'] = code;
          if (warehouse.type == 'physical'){
            warehouse._id = "warehouse.physical."+code;
          }
          this.pouchdbService.createDoc(warehouse).then(doc => {
            resolve({doc: doc, warehouse: warehouse});
          });
        });
      }

    });
  }

  getDefaultWarehouse(){
    return new Promise((resolve, reject)=>{
      this.configService.getConfigDoc().then(config => {
        this.pouchdbService.getDoc(config.warehouse_id).then(default_warehouse => {
          resolve(default_warehouse);
        })
      });
    });
  }

  updateWarehouse(warehouse){
    warehouse.docType = 'warehouse';
    delete warehouse.moves;
    delete warehouse.warehouse;
    return this.pouchdbService.updateDoc(warehouse);
  }

  deleteWarehouse(warehouse){
    return this.pouchdbService.deleteDoc(warehouse);
  }
}
