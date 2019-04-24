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
        // let promise_ids = [];
        // let pts = [];
        // let balance = 0;
        let getList = [];
        planneds.forEach(item => {
          // pts.push(item);
          // promise_ids.push(this.pouchdbService.getDoc(item.key[1]));
          getList.push(item.key[1]);
          // balance += parseFloat(item.value);
        })
        // promise_ids.push(this.pouchdbService.getDoc(doc_id));
        let area: any = await this.pouchdbService.getDoc(doc_id, true);
        console.log("area", area);

        let avatar = area._attachments['avatar.png'].data;
        this.firstFileToBase64(avatar).then((result: string) => {
          area.image = result;
        })
        let docs: any = await this.pouchdbService.getList(getList, true);
        console.log("docs", docs);

        // var doc_dict = {};
        area.moves = [];
        docs.forEach(row=>{
          delete row.doc.image;
          if (row.doc._attachments){
            // console.log("rowasdf", row.doc);
            let image = row.doc._attachments['image.png'].data;
            // console.log("image", image);
            this.firstFileToBase64(image).then((result: string) => {
              row.doc.image = result;
            });
          }
          area.moves.push(row.doc);
          if (row.doc.activity_id == 'activity.rain' && !area.lastRain){
            area.lastRain = row.doc.quantity;
            area.lastRainDate = row.doc.date;
          }
        })
        // console.log("area22", area);


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

  private firstFileToBase64(fileImage): Promise<{}> {
    return new Promise((resolve, reject) => {
      let fileReader: FileReader = new FileReader();
      if (fileReader && fileImage != null) {
        fileReader.readAsDataURL(fileImage);
        fileReader.onload = () => {
          let resultado = fileReader.result.toString().split(',')[1];
          console.log("to64", fileImage);
          // this.pouchdbService.attachFile(this._id, 'avatar.png', resultado);
          resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
          reject(error);
        };
      } else {
        reject(new Error('No file found'));
      }
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
