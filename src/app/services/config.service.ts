import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { FormatService } from '../services/format.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  data: any;
  code: string;

  constructor(
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
  ) {}

  getConfig(): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc('config.profile').then((configData: any) => {
        this.unserializeConfig(configData).then((data: any) => {
          this.pouchdbService.getDoc('contact.myCompany').then((contact: any) => {
            data.name = contact.name;
            data.doc  = contact.document;
            data.phone  = contact.phone;
            data.email  = contact.email;
            data.city  = contact.city;
            data.country  = contact.country;
            data.state  = contact.state;
            resolve(data);
          });
        });
      });
    });
  }

  getMyContact(): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc('contact.myCompany').then((data: any) => {
        resolve(data);
      });
    });
  }

  getConfigDoc(): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc('config.profile').then((data: any) => {
        this.pouchdbService.getDoc('contact.myCompany').then((contact: any) => {
          data.name = contact.name;
          data.doc  = contact.document;
          data.phone  = contact.phone;
          data.email  = contact.email;
          data.city  = contact.city;
          data.country  = contact.country;
          data.state  = contact.state;
          resolve(data);
        });
      });
    });
  }

  async unserializeConfig(pouchData){
    return new Promise(async (resolve, reject)=>{
      pouchData['travel_product'] = await this.pouchdbService.getDoc(pouchData['travel_product_id']);
      pouchData['warehouse'] = await this.pouchdbService.getDoc(pouchData['warehouse_id']);
      pouchData['currency'] = await this.pouchdbService.getDoc(pouchData['currency_id']);
      pouchData['labor_product'] = await this.pouchdbService.getDoc(pouchData['labor_product_id']);
      pouchData['contact'] = await this.pouchdbService.getDoc(pouchData['contact_id']);
      pouchData['cash'] = await this.pouchdbService.getDoc(pouchData['cash_id']);
      pouchData['default_contact'] = await this.pouchdbService.getDoc(pouchData['default_contact_id']);
      pouchData['default_payment'] = await this.pouchdbService.getDoc(pouchData['default_payment_id']);
      pouchData['product_sequence'] = (await this.pouchdbService.getDoc('sequence.product'))['value'];
      resolve(pouchData);
    });
  }

  serializeConfig(viewData){
    let config = Object.assign({}, viewData);
    config.docType = 'config';
    config.cash_id = config.cash._id;
    delete config.cash;
    config.default_contact_id = config.default_contact._id;
    delete config.default_contact;
    config.default_payment_id = config.default_payment._id;
    delete config.default_payment;
    config.account_id = config.account._id;
    delete config.account;
    config.warehouse_id = config.warehouse._id;
    delete config.warehouse;
    config.contact_id = config.contact._id;
    delete config.contact;
    config.currency_id = config.currency._id;
    delete config.currency;
    config.labor_product_id = config.labor_product._id;
    delete config.labor_product;
    config.travel_product_id = config.travel_product._id;
    delete config.travel_product;
    config.input_product_id = config.input_product._id;
    delete config.input_product;
    return config;
  }

  createConfig(viewData){
    let config = this.serializeConfig(viewData)
    return this.pouchdbService.createDoc(config);
  }

  cleanData(){
    // return this.pouchdbService.cleanData();
  }

  changeData(){
    // return this.pouchdbService.changeData();
  }

  updateConfig(viewData){
    let config = this.serializeConfig(viewData)
    return this.pouchdbService.updateDoc(config);
  }

  deleteConfig(config){
    return this.pouchdbService.deleteDoc(config);
  }

}
