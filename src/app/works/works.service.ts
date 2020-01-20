import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class WorksService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) { }

  getWorks(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let works: any = await this.pouchdbService.getDoc(doc_id, true);
      if (works._attachments && works._attachments['avatar.png']) {
        let avatar = works._attachments['avatar.png'].data;
        works.image = "data:image/png;base64," + avatar;
      } else {
        works.image = "./assets/icons/field.jpg";
      }
      resolve(works);
    });
  }

  getWorksRain(doc_id): Promise<any> {
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

  createWorks(viewData, blob = undefined) {
    let works = Object.assign({}, viewData);
    works.docType = 'works';
    delete works.moves;
    delete works.works;
    delete works.image;
    return new Promise((resolve, reject) => {
      if (works.code && works.code != '') {
        this.pouchdbService.createDoc(works).then(doc => {
          resolve({ doc: doc, works: works });
        });
      } else {
        this.configService.getSequence('works').then((code) => {
          works['code'] = code;
          this.pouchdbService.createDoc(works).then(async doc => {
            if (blob) {
              let avai = await this.pouchdbService.attachFile(
                doc['id'], 'avatar.png', blob);
            }
            resolve({ doc: doc, works: works });
          });
        });
      }
    });
  }

  async updateWorks(viewData, blob = undefined) {
    let works = Object.assign({}, viewData);
    works.docType = 'works';
    delete works.moves;
    delete works.works;
    delete works.image;
    if (blob) {
      await this.pouchdbService.attachFile(works._id, 'avatar.png', blob);
      let data: any = await this.pouchdbService.getDoc(works._id);
      let attachments = data._attachments;
      works._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(works);
  }

  deleteWork(work) {
    return this.pouchdbService.deleteDoc(work);
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeDataDoc(list, change)
  }

  getWorksPage(skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(today.getDate()+1);
      let day = tomorrow.toISOString().split("T")[0];
      console.log("getWorksPage");
      this.pouchdbService.getViewInv(
        'Informes/WorksDiario', 1,
        [day],
        ["0"],
        false,
        true,
        15,
        skip,
        true
      ).then(async (works: any[]) => {
        console.log("works", works);
        resolve(works);
      });
    });
  }

  getScheduledTasks(skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(today.getDate()+1);
      let day = tomorrow.toISOString().split("T")[0];
      this.pouchdbService.getViewInv(
        'Informes/WorksDiario', 1,
        ["z"],
        [today],
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
