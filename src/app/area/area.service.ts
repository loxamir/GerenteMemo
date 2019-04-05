import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
// import { AreaMoveService } from './move/area-move.service';

@Injectable()
export class AreaService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    // public areaMoveService: AreaMoveService,
  ) {}


  getArea(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Areas', 2,
        [doc_id, '0'],
        [doc_id, 'z']
      ).then(async (planneds: any[]) => {
        let promise_ids = [];
        let pts = [];
        let balance = 0;
        let getList = [];
        planneds.forEach(item => {
          pts.push(item);
          // promise_ids.push(this.pouchdbService.getDoc(item.key[1]));
          getList.push(item.key[1]);
          // balance += parseFloat(item.value);
        })
        // promise_ids.push(this.pouchdbService.getDoc(doc_id));
        let area: any = await this.pouchdbService.getDoc(doc_id);
        let docs: any = await this.pouchdbService.getList(getList);
        // var doc_dict = {};
        area.moves = [];
        docs.forEach(row=>{
          area.moves.push(row.doc);
          if (row.doc.activity_id == 'activity.rain'){
            area.lastRain = row.doc.quantity;
            area.lastRainDate = row.doc.date;
          }
        })
        console.log("area22", area);


        // let docList = await this.pouchdbService.getList(getList);
        // Promise.all(promise_ids).then(areaMoves => {
        //   // let area = Object.assign({}, areaMoves[areaMoves.length-1]);
        //   // let area = doc_dict[doc_id];
        //   // area.balance = balance;
        //   area.account = areaMoves[areaMoves.length-1];
        //   area.name
        //   for(let i=0;i<pts.length;i++){
        //     area.moves.unshift(areaMoves[i]);
        //   }
          resolve(area);
        // })
      });
    });
  }

  createArea(viewData){
    let area = Object.assign({}, viewData);
    area.docType = 'area';
    delete area.moves;
    delete area.area;
    return new Promise((resolve, reject)=>{
      if (area.code && area.code != ''){
        this.pouchdbService.createDoc(area).then(doc => {
          resolve({doc: doc, area: area});
        });
      } else {
        this.configService.getSequence('area').then((code) => {
          area['code'] = code;
          this.pouchdbService.createDoc(area).then(doc => {
            resolve({doc: doc, area: area});
          });
        });
      }

    });
  }

  getDefaultArea(){
    return new Promise((resolve, reject)=>{
      this.configService.getConfigDoc().then(config => {
        this.pouchdbService.getDoc(config.area_id).then(default_area => {
          resolve(default_area);
        })
      });
    });
  }

  updateArea(viewData){
    let area = Object.assign({}, viewData);
    area.docType = 'area';
    delete area.moves;
    delete area.area;
    return this.pouchdbService.updateDoc(area);
  }

  deleteArea(area){
    return this.pouchdbService.deleteDoc(area);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
