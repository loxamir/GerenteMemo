import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { FormatService } from '../services/format.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  data: any;
  code: string;

  constructor(
    public pouchdbService: PouchdbService,
    public storage: Storage,
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
        //console.log("data config", data);
        // if(data){
          // this.unserializeConfig(data._id).then(data => {
            resolve(data);
          // });
        // }
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
        // resolve(data);
      });
    });
  }

  async getUser(){
    let username = await this.storage.get('username');
    return username;
  }

  getSequence(docType): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      if (docType == 'product' || docType == 'user'){

        let sequence = await this.pouchdbService.getDoc(
          'sequence'+'.'+docType
        );
        let code = sequence['value'];
        // resolve(code['value']);

        // this.getConfigDoc().then((data) => {
          // let code = code['value'];
          //console.log("code", code);
          let regex = /[0-9]+$/
          let string_end = code.match(regex).index;
          let number = code.match(regex)[0];
          let next_number = parseFloat(number)+1;
          let prefix = code.substr(0, string_end);
          let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
          let new_code = prefix+pad_number;
          sequence['value'] = new_code;
          this.pouchdbService.updateDoc(sequence);
          resolve(code);
        // });
      } else {
        let user = await this.getUser();
        console.log("user", user);
        let data = await this.pouchdbService.getDoc('sequence.'+docType+'.'+user);
        let code = data['value'];
        console.log('code', code);
        let regex = /[0-9]+$/
        let string_end = code.match(regex).index;
        let number = code.match(regex)[0];
        let next_number = parseFloat(number)+1;
        let prefix = code.substr(0, string_end);
        let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
        let new_code = prefix+pad_number;
        data['value'] = new_code;
        console.log("data", data);
        let test = await this.pouchdbService.updateDoc(data);
        console.log("test", test);
        resolve(code);
      }
    });
    //code = this.formatService.string_pad(4, code.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  }

  showNextSequence(docType): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      if (docType == 'product' || docType == 'user'){
        let code = await this.pouchdbService.getDoc(
          'sequence'+'.'+docType
        );
        resolve(code['value']);
      } else {
        let user = await this.getUser();
        console.log("user", user);
        let code = await this.pouchdbService.getDoc(
          'sequence'+'.'+user+'.'+docType
        );
        console.log('code', code);
        resolve(code['value']);
      }
    });
    //code = this.formatService.string_pad(4, code.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  }

  setNextSequence(docType, current_code): Promise<any> {
    return new Promise(async (resolve, reject)=>{

      if (docType == 'product' || docType == 'user'){
        // this.code = current_code.toString();

        let data = await this.pouchdbService.getDoc('sequence'+'.'+docType);
        // this.getConfigDoc().then((data) => {
          //console.log("new_code", this.code);
          // let code = this.code;
          let regex = /[0-9]+$/;
          let string_end = current_code.match(regex).index;
          //console.log("string_end", string_end);
          let number = current_code.match(regex)[0];
          let next_number = parseFloat(number)+1;
          let prefix = current_code.substr(0, string_end);
          let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
          let new_code = prefix+pad_number;
          data['value'] = new_code;
          this.pouchdbService.updateDoc(data);
          resolve(current_code);
        // });
      } else {
        let user = this.getUser();
        // let code = data['value'];
        let data = await this.pouchdbService.getDoc('sequence'+'.'+docType+'.'+user);
        // console.log('code', code);
        let regex = /[0-9]+$/
        let string_end = current_code.match(regex).index;
        let number = current_code.match(regex)[0];
        let next_number = parseFloat(number)+1;
        let prefix = current_code.substr(0, string_end);
        let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
        let new_code = prefix+pad_number;
        data['value'] = new_code;
        console.log("data", data);
        let test = await this.pouchdbService.updateDoc(data);
        console.log("test", test);
        resolve(current_code);
        //console.log("new_code1", new_code);

      }
    });
    //code = this.formatService.string_pad(4, code.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  }

  unserializeConfig(pouchData){
    console.log("pouchData18", pouchData);
    return new Promise((resolve, reject)=>{
        let promise_ids = []
        let index = 0;
        let get_contact = false;
        let pay_cond_id = false;
        let account_id = false;
        let warehouse_id = false;
        let contact_id = false;
        let labor_product_id = false;
        let travel_product_id = false;
        let input_product_id = false;
        ////console.log("pouchData",pouchData);
        if (pouchData['currency_id']){
          promise_ids.push(this.pouchdbService.getDoc(pouchData['currency_id']));
          get_contact = true;
          index += 1;
        }
        if (pouchData['cash_id']){
          pay_cond_id = true;
          promise_ids.push(this.pouchdbService.getDoc(pouchData['cash_id']));
          index += 1;
        }
        if (pouchData['account_id']){
          account_id = true;
          promise_ids.push(this.pouchdbService.getDoc(pouchData['account_id']));
          index += 1;
        }
        if (pouchData['contact_id']){
          contact_id = true;
          promise_ids.push(this.pouchdbService.getDoc(pouchData['contact_id']));
          index += 1;
        }
        if (pouchData['labor_product_id']){
          labor_product_id = true;
          promise_ids.push(this.pouchdbService.getDoc(pouchData['labor_product_id']));
          index += 1;
        }
        if (pouchData['travel_product_id']){
          travel_product_id = true;
          promise_ids.push(this.pouchdbService.getDoc(pouchData['travel_product_id']));
          index += 1;
        }
        if (pouchData['input_product_id']){
          input_product_id = true;
          promise_ids.push(this.pouchdbService.getDoc(pouchData['input_product_id']));
          index += 1;
        }
        if (pouchData['warehouse_id']){
          warehouse_id = true;
          promise_ids.push(this.pouchdbService.getDoc(pouchData['warehouse_id']));
          index += 1;
        }
        index += 1;
        // promise_ids.push(this.getAvatar({'_id': doc_id}));
        Promise.all(promise_ids).then((promise_data) => {
          if (get_contact){
            pouchData['currency'] = promise_data[0];
          }
          if (pay_cond_id){
            pouchData['cash'] = promise_data[1];
          }
          if (account_id){
            pouchData['account'] = promise_data[2];
          }
          if (contact_id){
            pouchData['contact'] = promise_data[3];
          }
          if (labor_product_id){
            pouchData['labor_product'] = promise_data[4];
          }
          if (travel_product_id){
            pouchData['travel_product'] = promise_data[5];
          }
          if (input_product_id){
            pouchData['input_product'] = promise_data[6];
          }
          if (warehouse_id){
            pouchData['warehouse'] = promise_data[7];
          }
          // pouchData['image'] = promise_data[8];
          resolve(pouchData);
        });
    });
  }

  serializeConfig(viewData){
    let config = Object.assign({}, viewData);
    config.docType = 'config';
    config.cash_id = config.cash._id;
    delete config.cash;
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
