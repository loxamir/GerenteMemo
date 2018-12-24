import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PurchaseService {

  constructor(
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
  ) {}

  getPurchase(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializePurchase(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }

  createPurchase(viewData){
    return new Promise((resolve, reject)=>{
      let purchase = this.serializePurchase(viewData)
      this.configService.getSequence('purchase').then((code) => {
        purchase['code'] = code;
        this.pouchdbService.createDoc(purchase).then(doc => {
          resolve({doc: doc, purchase: purchase});
        });
      });
    });
  }

  serializePurchase(viewData){
    let purchase = Object.assign({}, viewData);
    purchase.lines = [];
    purchase.docType = 'purchase';
    // delete purchase.payments;
    delete purchase.planned;
    purchase.contact_id = purchase.contact._id;
    delete purchase.contact;
    purchase.project_id = purchase.project._id;
    delete purchase.project;
    purchase.pay_cond_id = purchase.paymentCondition._id;
    delete purchase.paymentCondition;
    purchase.items.forEach(item => {
      purchase.lines.push({
        product_id: item.product_id || item.product._id,
        product_name: item.product.name || item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
      })
    });
    delete purchase.items;
    return purchase;
  }

  unserializePurchase(doc_id){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
        let getList = [
          pouchData['contact_id'],
          pouchData['pay_cond_id']
        ];
        pouchData['lines'].forEach((item) => {
          if (getList.indexOf(item['product_id'])==-1){
            getList.push(item['product_id']);
          }
        });
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.contact = doc_dict[pouchData.contact_id] || {};
          pouchData.paymentCondition = doc_dict[pouchData.pay_cond_id] || {};
          let index=2;
          pouchData['items'] = [];
          pouchData.lines.forEach((line: any)=>{
            pouchData['items'].push({
              'product': doc_dict[line.product_id],
              'description': doc_dict[line.product_id].name,
              'quantity': line.quantity,
              'price': line.price,
              'cost': line.cost || 0,
            })
          })

          this.pouchdbService.getRelated(
          "cash-move", "origin_id", doc_id).then((planned) => {
            pouchData['planned'] = planned;
            resolve(pouchData);
          });
        })
      }));
    });
  }

  updatePurchase(viewData){
    let purchase = this.serializePurchase(viewData);
    return this.pouchdbService.updateDoc(purchase);
  }

  deletePurchase(purchase){
  //  if (purchase.state == 'QUOTATION'){
      return this.pouchdbService.deleteDoc(purchase);
  //  }
  }
}
