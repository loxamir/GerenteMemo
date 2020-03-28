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
    return new Promise(async (resolve, reject)=>{
      let configData:any = await this.pouchdbService.getDoc('config.profile', true);//.then((configData: any) => {
        if (configData._attachments && configData._attachments['logo.png']) {
          let logo = configData._attachments['logo.png'].data;
          configData.image = "data:image/png;base64," + logo;
        } else {
          configData.image = "./assets/images/sem_foto.jpg";
        }

        this.unserializeConfig(configData).then((data: any) => {
          // this.pouchdbService.getDoc('contact.myCompany').then((contact: any) => {
          //   data.name = contact.name;
          //   data.doc  = contact.document;
          //   data.phone  = contact.phone;
          //   data.email  = contact.email;
          //   data.city  = contact.city;
          //   data.country  = contact.country;
          //   data.state  = contact.state;
            resolve(data);
          // });
        });
    });
  }

  getConfigDoc(): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc('config.profile').then((data: any) => {
        // this.pouchdbService.getDoc('contact.myCompany').then((contact: any) => {
        //   data.name = contact.name;
        //   data.doc  = contact.document;
        //   data.phone  = contact.phone;
        //   data.email  = contact.email;
        //   data.city  = contact.city;
        //   data.country  = contact.country;
        //   data.state  = contact.state;
          resolve(data);
        // });
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
      if (docType == 'product' || docType == 'user' || docType == 'cash'){

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
        // console.log("user", user);
        let data = await this.pouchdbService.getDoc('sequence.'+docType+'.'+user);
        let code = data['value'];
        // console.log('code', code);
        let regex = /[0-9]+$/
        let string_end = code.match(regex).index;
        let number = code.match(regex)[0];
        let next_number = parseFloat(number)+1;
        let prefix = code.substr(0, string_end);
        let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
        let new_code = prefix+pad_number;
        data['value'] = new_code;
        // console.log("data", data);
        let test = await this.pouchdbService.updateDoc(data);
        // console.log("test", test);
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
        // console.log("user", user);
        let code = await this.pouchdbService.getDoc(
          'sequence'+'.'+docType+'.'+user
        );
        // console.log('code', code);
        resolve(code['value']);
      }
    });
    //code = this.formatService.string_pad(4, code.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  }

  setNextSequence(docType, current_code, new_code=null): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let od_code = new_code;
      if (docType == 'product' || docType == 'user'){
        // this.code = current_code.toString();

        let data = await this.pouchdbService.getDoc('sequence'+'.'+docType);
        // this.getConfigDoc().then((data) => {
          //console.log("new_code", this.code);
          // let code = this.code;
          if (od_code){
            data['value'] = od_code;
            this.pouchdbService.updateDoc(data);
            resolve(current_code);
          } else {
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
          }
        // });
      } else {
        let user = await this.getUser();
        // let code = data['value'];
        // console.log("user", user);
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
        // console.log("data", data);
        let test = await this.pouchdbService.updateDoc(data);
        // console.log("test", test);
        resolve(current_code);
        //console.log("new_code1", new_code);

      }
    });
    //code = this.formatService.string_pad(4, code.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  }

  async unserializeConfig(pouchData){
    return new Promise(async (resolve, reject)=>{
      let getList = [
        // pouchData['travel_product_id'],
        // pouchData['warehouse_id'],
        pouchData['currency_id'],
        // pouchData['labor_product_id'],
        // pouchData['contact_id'],
        // pouchData['cash_id'],
        // pouchData['default_contact_id'],
        // pouchData['default_payment_id'],
        'sequence.product',
      ];
      // pouchData['promoted_products'].forEach((item) => {
      //   if (getList.indexOf(item['product_id'])==-1){
      //     getList.push(item['product_id']);
      //   }
      // });

      // pouchData['promoted_categories'].forEach((item) => {
      //   if (getList.indexOf(item['category_id'])==-1){
      //     getList.push(item['category_id']);
      //   }
      // });

      this.pouchdbService.getList(getList, true).then((docs: any[])=>{
        var doc_dict = {};
        docs.forEach(row=>{
          doc_dict[row.id] = row.doc;
        })
        // pouchData['travel_product'] = doc_dict[pouchData['travel_product_id']] || {};
        // pouchData['warehouse'] = doc_dict[pouchData['warehouse_id']] || {};
        pouchData['currency'] = doc_dict[pouchData['currency_id']] || {};
        // pouchData['labor_product'] = doc_dict[pouchData['labor_product_id']] || {};
        // pouchData['contact'] = doc_dict[pouchData['contact_id']] || {};
        // pouchData['cash'] = doc_dict[pouchData['cash_id']];
        // pouchData['default_contact'] = doc_dict[pouchData['default_contact_id']] || {};
        // pouchData['default_payment'] = doc_dict[pouchData['default_payment_id']] || {};
        pouchData['product_sequence'] = (doc_dict['sequence.product'])['value'];
        // pouchData['products'] = [];
        // pouchData.promoted_products.forEach((line: any)=>{
        //   if (doc_dict[line.product_id]){
        //     pouchData['products'].push(doc_dict[line.product_id]);
        //   }
        // })
        // pouchData['categories'] = [];
        // pouchData.promoted_categories.forEach((line: any)=>{
        //   pouchData['categories'].push(doc_dict[line.category_id]);
        // })
        resolve(pouchData);
      });
    });
  }

  serializeConfig(viewData){
    let config = Object.assign({}, viewData);
    config.docType = 'config';
    // config.cash_id = config.cash._id;
    // delete config.cash;
    // config.default_contact_id = config.default_contact._id;
    // delete config.default_contact;
    // config.default_payment_id = config.default_payment._id;
    // delete config.default_payment;
    // config.account_id = config.account._id;
    // delete config.account;
    // config.warehouse_id = config.warehouse._id;
    // delete config.warehouse;
    // config.contact_id = config.contact._id;
    // delete config.contact;
    config.currency_id = config.currency._id;
    delete config.currency;
    // config.labor_product_id = config.labor_product._id;
    // delete config.labor_product;
    // config.travel_product_id = config.travel_product._id;
    // delete config.travel_product;
    // config.input_product_id = config.input_product._id;
    // delete config.input_product;
    delete config.image;
    // config.promoted_products = [];
    // config.products.forEach(item => {
    //   config.promoted_products.push({
    //     product_id: item._id,
    //     product_name: item.name,
    //   })
    // });
    // delete config.products;
    // config.promoted_categories = [];
    // config.categories.forEach(item => {
    //   config.promoted_categories.push({
    //     category_id: item._id,
    //     category_name: item.name,
    //   })
    // });
    // delete config.categories;
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

  async updateConfig(viewData, blob){
    let config:any = this.serializeConfig(viewData);
    if (blob) {
      await this.pouchdbService.attachFile(config._id, 'logo.png', blob);
      let data: any = await this.pouchdbService.getDoc(config._id);
      let attachments = data._attachments;
      config._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(config);
  }

  deleteConfig(config){
    return this.pouchdbService.deleteDoc(config);
  }

}
