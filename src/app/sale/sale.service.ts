import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '../services/config.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  constructor(
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
  ) {}

  getSale(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializeSale(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }

  createSale(viewData){
    return new Promise((resolve, reject)=>{
      let sale = this.serializeSale(viewData);
      if (sale.code != ''){
        this.pouchdbService.createDoc(sale).then(doc => {
          resolve({doc: doc, sale: sale});
        });
      } else {
        this.configService.getSequence('sale').then((code) => {
          sale['code'] = code;
          this.pouchdbService.createDoc(sale).then(doc => {
            resolve({doc: doc, sale: sale});
          });
        });
      }

    });
  }

  serializeSale(viewData){
    let sale = Object.assign({}, viewData);
    sale.lines = [];
    sale.docType = 'sale';
    sale.contact_id = sale.contact._id;
    delete sale.contact;
    sale.address_id = sale.address._id;
    delete sale.address;
    sale.project_id = sale.project && sale.project._id || "";
    delete sale.project;
    sale.pay_cond_id = sale.paymentCondition._id;
    delete sale.paymentCondition;
    sale.items.forEach(item => {
      sale.lines.push({
        product_id: item.product_id || item.product._id,
        product_name: item.product.name || item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
        size: item.size,
        note: item.note,
      })
    });
    delete sale.items;
    // sale.moves = [];
    // sale.planned.forEach(item => {
    //   sale.moves.push(item._id)
    // });
    delete sale.planned;
    return sale;
  }

  serializeSaleMigrated(viewData){
    let sale = Object.assign({}, viewData);
    sale.docType = 'sale';
    delete sale.planned;
    sale.contact_id = sale.contact._id;
    delete sale.contact;
    sale.address_id = sale.address._id;
    delete sale.address;
    sale.project_id = sale.project && sale.project._id || "";
    delete sale.project;
    sale.pay_cond_id = sale.paymentCondition._id;
    delete sale.paymentCondition;
    return sale;
  }

  unserializeSale(doc_id){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
        let getList = [
          pouchData['contact_id'],
          pouchData['address_id'],
          pouchData['pay_cond_id']
        ];
        pouchData['lines'].forEach((item) => {
          if (getList.indexOf(item['product_id'])==-1){
            getList.push(item['product_id']);
          }
        });
        // if (pouchData['moves']){
        //   pouchData['moves'].forEach((item) => {
        //     if (getList.indexOf(item)==-1){
        //       getList.push(item);
        //     }
        //   });
        // }
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.contact = doc_dict[pouchData.contact_id] || {};
          pouchData.address = doc_dict[pouchData.address_id] || {};
          pouchData.paymentCondition = doc_dict[pouchData.pay_cond_id] || {};
          pouchData['items'] = [];
          pouchData.lines.forEach((line: any)=>{
            pouchData['items'].push({
              'product': doc_dict[line.product_id],
              'description': doc_dict[line.product_id].name,
              'quantity': line.quantity,
              'price': line.price,
              'cost': line.cost || 0,
              'size': line.size,
              'note': line.note,
            })
          })
          // if (pouchData.moves){
          //   pouchData['planned'] = [];
          //   pouchData.moves.forEach(line=>{
          //     console.log("liena", line);
          //     pouchData['planned'].push(doc_dict[line])
          //   })
          //   console.log("doc_dict", doc_dict);
          //   resolve(pouchData);
          // } else {
            this.pouchdbService.getRelated(
            "cash-move", "origin_id", doc_id).then((planned) => {
              pouchData['planned'] = planned.filter(word=>typeof word.amount_residual !== 'undefined');
              resolve(pouchData);
            });
          // }
        })
      }));
    });
  }

  updateSale(viewData){
    let sale = this.serializeSale(viewData);
    return this.pouchdbService.updateDoc(sale);
  }

  updateSaleMigrated(viewData){
    let sale = this.serializeSaleMigrated(viewData);
    return this.pouchdbService.updateDoc(sale);
  }

  deleteSale(sale){
  //  if (sale.state == 'QUOTATION'){
      return this.pouchdbService.deleteDoc(sale);
  //  }
  }
}
