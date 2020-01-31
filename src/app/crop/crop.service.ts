import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
// import { CropMoveService } from './move/crop-move.service';

@Injectable()
export class CropService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    // public cropMoveService: CropMoveService,
  ) {}


  getCrop(doc_id): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let crop:any = await this.pouchdbService.getDoc(doc_id);
      crop.fields = crop.fields || [];
      let getList = [
        crop['product_id'],
      ];
      crop['fields'].forEach((item) => {
        if (getList.indexOf(item['field_id'])==-1){
          getList.push(item['field_id']);
        }
      });
      let docs:any = await this.pouchdbService.getList(getList);
      var doc_dict = {};
      docs.forEach(row=>{
        doc_dict[row.id] = row.doc;
      })
      crop.product = doc_dict[crop.product_id] || {};
      crop['items'] = [];
      crop.fields.forEach((field: any)=>{
        crop['items'].push({
          'field': doc_dict[field.field_id],
          'quantity': field.quantity,
        })
      })
      resolve(crop);
    });
  }

  createCrop(viewData){
    let crop = Object.assign({}, viewData);
    crop.docType = 'crop';
    delete crop.moves;
    crop.product_id = crop.product._id;
    delete crop.product;
    crop.items.forEach(item => {
      crop.fields.push({
        field_id: item.field_id || item.field._id,
        field_name: item.field.name || item.field_name,
        quantity: item.quantity,
      })
    });
    delete crop.items;
    return new Promise((resolve, reject)=>{
      if (crop.code && crop.code != ''){
        this.pouchdbService.createDoc(crop).then(doc => {
          resolve({doc: doc, crop: crop});
        });
      } else {
        this.configService.getSequence('crop').then((code) => {
          crop['code'] = code;
          this.pouchdbService.createDoc(crop).then(doc => {
            resolve({doc: doc, crop: crop});
          });
        });
      }
    });
  }

  getDefaultCrop(){
    return new Promise((resolve, reject)=>{
      this.configService.getConfigDoc().then(config => {
        this.pouchdbService.getDoc(config.crop_id).then(default_crop => {
          resolve(default_crop);
        })
      });
    });
  }

  updateCrop(viewData){
    let crop = Object.assign({}, viewData);
    crop.docType = 'crop';
    delete crop.moves;
    delete crop.crop;
    crop.product_id = crop.product._id;
    delete crop.product;
    crop.items.forEach(item => {
      crop.fields.push({
        field_id: item.field_id || item.field._id,
        field_name: item.field.name || item.field_name,
        quantity: item.quantity,
      })
    });
    delete crop.items;
    return this.pouchdbService.updateDoc(crop);
  }

  deleteCrop(crop){
    return this.pouchdbService.deleteDoc(crop);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
