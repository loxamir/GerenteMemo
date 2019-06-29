import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
  ) {}

  getContract(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializeContract(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }

  createContract(viewData){
    return new Promise((resolve, reject)=>{
      let contract = this.serializeContract(viewData);
      if (contract.code != ''){
        this.pouchdbService.createDoc(contract).then(doc => {
          resolve({doc: doc, contract: contract});
        });
      } else {
        this.configService.getSequence('contract').then((code) => {
          contract['code'] = code;
          this.pouchdbService.createDoc(contract).then(doc => {
            resolve({doc: doc, contract: contract});
          });
        });
      }

    });
  }

  serializeContract(viewData){
    let contract = Object.assign({}, viewData);
    contract.lines = [];
    contract.docType = 'contract';
    // delete contract.payments;
    delete contract.planned;
    contract.contact_id = contract.contact._id;
    delete contract.contact;
    contract.project_id = contract.project && contract.project._id || "";
    delete contract.project;
    contract.pay_cond_id = contract.paymentCondition._id;
    delete contract.paymentCondition;
    contract.items.forEach(item => {
      contract.lines.push({
        product_id: item.product_id || item.product._id,
        product_name: item.product.name || item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
      })
      //item['product_id'] = item.product_id || item.product._id;
    });
    delete contract.items;
    return contract;
  }

  serializeContractMigrated(viewData){
    let contract = Object.assign({}, viewData);
    contract.docType = 'contract';
    delete contract.planned;
    contract.contact_id = contract.contact._id;
    delete contract.contact;
    contract.project_id = contract.project && contract.project._id || "";
    delete contract.project;
    contract.pay_cond_id = contract.paymentCondition._id;
    delete contract.paymentCondition;
    return contract;
  }

  unserializeContract(doc_id){
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

  updateContract(viewData){
    let contract = this.serializeContract(viewData);
    return this.pouchdbService.updateDoc(contract);
  }

  updateContractMigrated(viewData){
    let contract = this.serializeContractMigrated(viewData);
    return this.pouchdbService.updateDoc(contract);
  }

  deleteContract(contract){
  //  if (contract.state == 'QUOTATION'){
      return this.pouchdbService.deleteDoc(contract);
  //  }
  }
}
