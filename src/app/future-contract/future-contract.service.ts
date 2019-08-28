import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class FutureContractService {

  constructor(
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
  ) {}

  getFutureContract(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializeFutureContract(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }

  createFutureContract(viewData){
    return new Promise((resolve, reject)=>{
      let futureContract = this.serializeFutureContract(viewData);
      if (futureContract.code != ''){
        this.pouchdbService.createDoc(futureContract).then(doc => {
          resolve({doc: doc, futureContract: futureContract});
        });
      } else {
        this.configService.getSequence('future-contract').then((code) => {
          futureContract['code'] = code;
          this.pouchdbService.createDoc(futureContract).then(doc => {
            resolve({doc: doc, futureContract: futureContract});
          });
        });
      }

    });
  }

  serializeFutureContract(viewData){
    let futureContract = Object.assign({}, viewData);
    futureContract.lines = [];
    futureContract.docType = 'future-contract';
    futureContract.contact_id = futureContract.contact._id;
    delete futureContract.contact;
    futureContract.project_id = futureContract.project && futureContract.project._id || "";
    delete futureContract.project;
    futureContract.product_id = futureContract.product._id;
    delete futureContract.product;
    // futureContract.items.forEach(item => {
    //   futureContract.lines.push({
    //     product_id: item.product_id || item.product._id,
    //     product_name: item.product.name || item.product_name,
    //     quantity: item.quantity,
    //     price: item.price,
    //     cost: item.cost,
    //   })
    // });
    // delete futureContract.items;
    // futureContract.moves = [];
    // futureContract.planned.forEach(item => {
    //   futureContract.moves.push(item._id)
    // });
    delete futureContract.planned;
    delete futureContract.deliveries;

    futureContract.crop_id = futureContract.crop._id;
    delete futureContract.crop;
    futureContract.warehouse_id = futureContract.warehouse._id;
    delete futureContract.warehouse;
    return futureContract;
  }

  serializeFutureContractMigrated(viewData){
    let futureContract = Object.assign({}, viewData);
    futureContract.docType = 'future-contract';
    delete futureContract.planned;
    futureContract.contact_id = futureContract.contact._id;
    delete futureContract.contact;
    futureContract.project_id = futureContract.project && futureContract.project._id || "";
    delete futureContract.project;
    futureContract.product_id = futureContract.product._id;
    delete futureContract.product;
    return futureContract;
  }

  unserializeFutureContract(doc_id){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
        let getList = [
          pouchData['contact_id'],
          pouchData['product_id'],
          pouchData['crop_id'],
          pouchData['warehouse_id'],
        ];
        // pouchData['lines'].forEach((item) => {
        //   if (getList.indexOf(item['product_id'])==-1){
        //     getList.push(item['product_id']);
        //   }
        // });
        // if (pouchData['moves']){
        //   pouchData['moves'].forEach((item) => {
        //     if (getList.indexOf(item)==-1){
        //       getList.push(item);
        //     }
        //   });
        // }
        this.pouchdbService.getList(getList).then(async (docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.contact = doc_dict[pouchData.contact_id] || {};
          pouchData.product = doc_dict[pouchData.product_id] || {};
          pouchData.crop = doc_dict[pouchData.crop_id] || {};
          pouchData.warehouse = doc_dict[pouchData.warehouse_id] || {};
          // pouchData['items'] = [];
          // pouchData.lines.forEach((line: any)=>{
          //   pouchData['items'].push({
          //     'product': doc_dict[line.product_id],
          //     'description': doc_dict[line.product_id].name,
          //     'quantity': line.quantity,
          //     'price': line.price,
          //     'cost': line.cost || 0,
          //   })
          // })
          // if (pouchData.moves){
          //   pouchData['planned'] = [];
          //   pouchData.moves.forEach(line=>{
          //     console.log("liena", line);
          //     pouchData['planned'].push(doc_dict[line])
          //   })
          //   console.log("doc_dict", doc_dict);
          //   resolve(pouchData);
          // } else {
          // let planned:any = await this.pouchdbService.getRelated(
          //   "cash-move", "origin_id", doc_id);//.then((planned) => {
          // pouchData['planned'] = planned.filter(word=>typeof word.amount_residual !== 'undefined');
            // });
          // }

          // this.pouchdbService.getView("Informes/Entregas", )
          let deliveries:any = await this.pouchdbService.getView(
            'Informes/Entregas', 2,
            [doc_id, '0'],
            [doc_id, 'z'],
            true,
            true,
            undefined,
            undefined,
            true,
            undefined
          );//.then((view: any[]) => {})
          pouchData['deliveries'] = deliveries;
          var sum = deliveries.reduce( function( prevVal, elem ) {
            return prevVal + elem.value[0];
          }, 0 );
          pouchData['delivered'] = sum;
          pouchData['residual'] = pouchData.quantity - sum;

          // this.pouchdbService.getView("Informes/VendasContrato", )
          let sales:any = await this.pouchdbService.getView(
            'Informes/VentasContrato', 2,
            [doc_id, '0'],
            [doc_id, 'z'],
            true,
            true,
            undefined,
            undefined,
            true,
            undefined
          );//.then((view: any[]) => {})
          pouchData['sales'] = sales;
          let sumsale = sales.reduce( function( prevVal, elem ) {
            return prevVal + elem.value[0];
          }, 0 );
          pouchData['sold'] = sumsale;

          resolve(pouchData);
        })
      }));
    });
  }

  updateFutureContract(viewData){
    let futureContract = this.serializeFutureContract(viewData);
    return this.pouchdbService.updateDoc(futureContract);
  }

  updateFutureContractMigrated(viewData){
    let futureContract = this.serializeFutureContractMigrated(viewData);
    return this.pouchdbService.updateDoc(futureContract);
  }

  deleteFutureContract(futureContract){
  //  if (futureContract.state == 'QUOTATION'){
      return this.pouchdbService.deleteDoc(futureContract);
  //  }
  }
}
