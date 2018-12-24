import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class ServiceService {

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
  ) {}

  getService(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializeService(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }

  createService(viewData){
    return new Promise((resolve, reject)=>{
      let service = this.serializeService(viewData)
      this.configService.getSequence('service').then((code) => {
        service['code'] = code;
        this.pouchdbService.createDoc(service).then(doc => {
          resolve({doc: doc, service: service});
        });
      });
    });
  }

  serializeService(viewData){
    let service = Object.assign({}, viewData);
    service.lines = [];
    service.docType = 'service';
    delete service.planned;
    // delete service.payments;
    service.contact_id = service.contact._id;
    delete service.contact;

    service.pay_cond_id = service.paymentCondition._id;
    delete service.paymentCondition;
    // service.project_id = service.project._id;
    // delete service.project;
    service.inputs.forEach(input => {
      service.lines.push({
        product_id: input.product_id || input.product._id,
        product_name: input.product._id || input.product_name,
        description: input.description,
        quantity: input.quantity,
        price: input.price,
        cost: input.cost,
      })
      //input['product_id'] = input.product_id || input.product._id;
    });
    delete service.inputs;
    return service;
  }

  unserializeService(doc_id){
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
          pouchData['inputs'] = [];
          pouchData.lines.forEach((line: any)=>{
            pouchData['inputs'].push({
              'product': doc_dict[line.product_id],
              'description': line.description,
              'quantity': line.quantity,
              'price': line.price,
              'cost': line.cost,
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

  // unserializeService(doc_id){
  //   return new Promise((resolve, reject)=>{
  //     return this.pouchdbService.getDoc(doc_id).then((pouchData => {
  //       let promise_ids = []
  //       let index = 0;
  //       let get_contact = false;
  //       let get_responsable = false;
  //       // let project_id = false;
  //       ////console.log("pouchData",pouchData);
  //       if (pouchData['contact_id']){
  //         promise_ids.push(this.pouchdbService.getDoc(pouchData['contact_id']));
  //         get_contact = true;
  //         index += 1;
  //       }
  //       if (pouchData['responsable_id']){
  //         get_responsable = true;
  //         promise_ids.push(this.pouchdbService.getDoc(pouchData['responsable_id']));
  //         index += 1;
  //       }
  //       pouchData['lines'].forEach((input) => {
  //         promise_ids.push(this.productService.getProduct(input['product_id']));
  //       });
  //       pouchData['inputs'] = [];
  //       Promise.all(promise_ids).then((promise_data) => {
  //         if (get_contact){
  //           pouchData['contact'] = promise_data[0];
  //         }
  //         if (get_responsable){
  //           pouchData['responsable'] = promise_data[1];
  //         }
  //         for(let i=index;i<pouchData['lines'].length+index;i++){
  //           pouchData['inputs'].push({
  //             'product': promise_data[i],
  //             'description': pouchData['lines'][i-index]['description'],
  //             'quantity': pouchData['lines'][i-index]['quantity'],
  //             'price': pouchData['lines'][i-index]['price'],
  //             'cost': pouchData['lines'][i-index]['cost'],
  //           })
  //         }
  //         this.pouchdbService.getRelated(
  //         "cash-move", "origin_id", doc_id).then((planned) => {
  //           console.log("Planned", planned);
  //           pouchData['planned'] = planned;
  //           resolve(pouchData);
  //         });
  //       });
  //     }));
  //   });
  // }

  updateService(viewData){
    let service = this.serializeService(viewData)
    return this.pouchdbService.updateDoc(service);
  }

  deleteService(service){
  //  if (service.state == 'QUOTATION'){
      return this.pouchdbService.deleteDoc(service);
  //  }
  }
}
