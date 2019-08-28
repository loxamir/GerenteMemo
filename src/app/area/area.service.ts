import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AreaService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) { }

  getArea(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let area: any = await this.pouchdbService.getDoc(doc_id, true);
      if (area._attachments && area._attachments['avatar.png']) {
        let avatar = area._attachments['avatar.png'].data;
        area.image = "data:image/png;base64," + avatar;
      } else {
        area.image = "./assets/icons/field.jpg";
      }
      resolve(area);
    });
  }

  getAreaRain(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.pouchdbService.getViewInv(
        'Informes/Chuva', 2,
        [doc_id, 'z'],
        [doc_id, '0'],
        true,
        true,
        1
      ).then(async (rains: any[]) => {
        if (rains.length) {
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

  createArea(viewData, blob = undefined) {
    let area = Object.assign({}, viewData);
    area.docType = 'area';
    delete area.moves;
    delete area.area;
    delete area.image;
    return new Promise((resolve, reject) => {
      if (area.code && area.code != '') {
        this.pouchdbService.createDoc(area).then(doc => {
          resolve({ doc: doc, area: area });
        });
      } else {
        this.configService.getSequence('area').then((code) => {
          area['code'] = code;
          this.pouchdbService.createDoc(area).then(async doc => {
            if (blob) {
              let avai = await this.pouchdbService.attachFile(
                doc['id'], 'avatar.png', blob);
            }
            resolve({ doc: doc, area: area });
          });
        });
      }
    });
  }

  async updateArea(viewData, blob = undefined) {
    let area = Object.assign({}, viewData);
    area.docType = 'area';
    delete area.moves;
    delete area.area;
    delete area.image;
    if (blob) {
      await this.pouchdbService.attachFile(area._id, 'avatar.png', blob);
      let data: any = await this.pouchdbService.getDoc(area._id);
      let attachments = data._attachments;
      area._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(area);
  }

  deleteArea(area) {
    return this.pouchdbService.deleteDoc(area);
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeDataDoc(list, change)
  }

  getWorksPage(area_id, skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(today.getDate()+1);
      let day = tomorrow.toISOString().split("T")[0];
      this.pouchdbService.getViewInv(
        'Informes/AreaDiario', 1,
        [area_id, day],
        [area_id, "0"],
        false,
        true,
        15,
        skip,
        true
      ).then(async (works: any[]) => {
        resolve(works);
      });
    });
  }

  getScheduledTasks(area_id, skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(today.getDate()+1);
      let day = tomorrow.toISOString().split("T")[0];
      this.pouchdbService.getViewInv(
        'Informes/AreaDiario', 1,
        [area_id, "z"],
        [area_id, today],
        false,
        true,
        15,
        skip,
        true
      ).then(async (works: any[]) => {
        resolve(works);
      });
    });
  }
}
