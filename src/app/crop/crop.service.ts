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
    return new Promise((resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Crops', 1,
        [doc_id, '0'],
        [doc_id, 'z']
      ).then((planneds: any[]) => {
        let promise_ids = [];
        let pts = [];
        let balance = 0;
        planneds.forEach(item => {
          pts.push(item);
          promise_ids.push(this.pouchdbService.getDoc(item.key[0]));
          balance += parseFloat(item.value);
        })
        promise_ids.push(this.pouchdbService.getDoc(doc_id));
        Promise.all(promise_ids).then(cropMoves => {
          let crop = Object.assign({}, cropMoves[cropMoves.length-1]);
          crop.moves = [];
          crop.balance = balance;
          crop.account = cropMoves[cropMoves.length-1];
          crop.name
          for(let i=0;i<pts.length;i++){
            crop.moves.unshift(cropMoves[i]);
          }
          resolve(crop);
        })
      });
    });
  }

  createCrop(viewData){
    let crop = Object.assign({}, viewData);
    crop.docType = 'crop';
    delete crop.moves;
    return new Promise((resolve, reject)=>{
      if (crop.code && crop.code != ''){
        this.pouchdbService.createDoc(crop).then(doc => {
          resolve({doc: doc, area: crop});
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

  updateCrop(crop){
    crop.docType = 'account';
    delete crop.moves;
    delete crop.crop;
    return this.pouchdbService.updateDoc(crop);
  }

  deleteCrop(crop){
    return this.pouchdbService.deleteDoc(crop);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
