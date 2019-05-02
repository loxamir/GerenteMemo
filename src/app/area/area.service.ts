import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AreaService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}


  getArea(doc_id): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let area: any = await this.pouchdbService.getDoc(doc_id, true);
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/AreaDiario', 4,
        ['z', doc_id, 'z'],
        ['0', doc_id, '0'],
        true,
        true,
        5
      ).then(async (planneds: any[]) => {
        let getList = [];
        planneds.forEach(item => {
          getList.push(item.key[3]);
        })
        if (area._attachments && area._attachments['avatar.png']){
          let avatar = area._attachments['avatar.png'].data;
          area.image = "data:image/png;base64,"+avatar;
        } else {
          area.image = "./assets/icons/field.jpg";
        }
        resolve(area);
      });
    });
  }

  getAreaRain(doc_id): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/Chuva', 2,
        [doc_id, 'z'],
        [doc_id, '0'],
        true,
        true,
        1
      ).then(async (rains: any[]) => {
        if (rains.length){
          resolve({
            date: rains[0].key[1],
            quantity: rains[0].value
          });
        } else {
          resolve(false)
        }
      });
    });
  }

  createArea(viewData, blob=undefined){
    let area = Object.assign({}, viewData);
    area.docType = 'area';
    delete area.moves;
    delete area.area;
    delete area.image;
    return new Promise((resolve, reject)=>{
      if (area.code && area.code != ''){
        this.pouchdbService.createDoc(area).then(doc => {
          resolve({doc: doc, area: area});
        });
      } else {
        this.configService.getSequence('area').then((code) => {
          area['code'] = code;
          this.pouchdbService.createDoc(area).then(async doc => {
            if (blob){
              console.log("blob", doc);
              let avai = await this.pouchdbService.attachFile(doc['id'], 'avatar.png', blob);
            }
            resolve({doc: doc, area: area});
          });
        });
      }

    });
  }

  async updateArea(viewData, blob=undefined){
    let area = Object.assign({}, viewData);
    area.docType = 'area';
    delete area.moves;
    delete area.area;
    delete area.image;
    if (blob){
      await this.pouchdbService.attachFile(area._id, 'avatar.png', blob);
      let data:any = await this.pouchdbService.getDoc(area._id);
      let attachments = data._attachments;
      area._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(area);
  }

  deleteArea(area){
    return this.pouchdbService.deleteDoc(area);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  getWorksPage(area_id, skip=0): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/AreaDiario', 4,
        [area_id+"z", "z"],
        [area_id, "0"],
        true,
        true,
        15,
        skip
      ).then(async (planneds: any[]) => {
        let getList = [];
        planneds.forEach(item => {
          getList.push(item.key[3]);
        })
        let docs: any = await this.pouchdbService.getList(getList, true);
        let moves = [];
        docs.forEach(row=>{
          moves.push(row.doc);
        })
        resolve(moves);
      });
    });
  }
}
