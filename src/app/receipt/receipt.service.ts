import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor(
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
  ) {}

  getReceipt(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializeReceipt(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }

  createReceipt(viewData){
    return new Promise((resolve, reject)=>{
      let receipt = this.serializeReceipt(viewData);
      this.configService.getSequence('receipt').then((code) => {
        receipt['code'] = code;
        this.pouchdbService.createDoc(receipt).then(doc => {
          resolve({doc: doc, receipt: receipt});
        });
      });
    });
  }

  serializeReceipt(viewData){
    let receipt = Object.assign({}, viewData);
    receipt.lines = [];
    receipt.docType = 'receipt';
    if (receipt['state'] != 'QUOTATION'){
      delete receipt.payments;
    }
    delete receipt.planned;
    delete receipt.amount_paid;
    receipt.cash_id = receipt.cash_paid._id;
    delete receipt.cash_paid;
    receipt.contact_id = receipt.contact._id;
    delete receipt.contact;
    return receipt;
  }

  unserializeReceipt(doc_id){
    return new Promise((resolve, reject)=>{
      return this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
        let getList = [
          pouchData['contact_id'],
          pouchData['cash_id']
        ];
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.contact = doc_dict[pouchData.contact_id] || {};
          pouchData.cash_paid = doc_dict[pouchData.cash_id] || {};

          if (pouchData['state'] != 'QUOTATION'){
            this.pouchdbService.getRelated(
            "cash-move", "origin_id", doc_id).then((payments) => {
              pouchData['payments'] = payments;
              resolve(pouchData);
            });
          } else {
            resolve(pouchData);
          }
        })
      }));
    });
  }

  updateReceipt(viewData){
    let receipt = this.serializeReceipt(viewData)
    return this.pouchdbService.updateDoc(receipt);
  }

  deleteReceipt(receipt){
    return this.pouchdbService.deleteDoc(receipt);
  }

}