import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AnimalService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) { }


  getAnimal(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let animal: any = await this.pouchdbService.getDoc(doc_id, true);
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/AnimalDiario', 4,
        [doc_id, 'z'],
        [doc_id, '0'],
        true,
        true,
        5
      ).then(async (planneds: any[]) => {
        let getList = [];
        planneds.forEach(item => {
          getList.push(item.key[3]);
        })
        if (animal._attachments && animal._attachments['avatar.png']) {
          let avatar = animal._attachments['avatar.png'].data;
          animal.image = "data:image/png;base64," + avatar;
        } else {
          animal.image = "./assets/icons/field.jpg";
        }
        resolve(animal);
      });
    });
  }

  getAnimalRain(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/Chuva', 2,
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

  createAnimal(viewData, blob = undefined) {
    let animal = Object.assign({}, viewData);
    animal.docType = 'animal';
    delete animal.moves;
    delete animal.animal;
    delete animal.image;
    return new Promise((resolve, reject) => {
      if (animal.code && animal.code != '') {
        this.pouchdbService.createDoc(animal).then(doc => {
          resolve({ doc: doc, animal: animal });
        });
      } else {
        this.configService.getSequence('animal').then((code) => {
          animal['code'] = code;
          this.pouchdbService.createDoc(animal).then(async doc => {
            if (blob) {
              console.log("blob", doc);
              let avai = await this.pouchdbService.attachFile(doc['id'], 'avatar.png', blob);
            }
            resolve({ doc: doc, animal: animal });
          });
        });
      }

    });
  }

  async updateAnimal(viewData, blob = undefined) {
    let animal = Object.assign({}, viewData);
    animal.docType = 'animal';
    delete animal.moves;
    delete animal.animal;
    delete animal.image;
    if (blob) {
      await this.pouchdbService.attachFile(animal._id, 'avatar.png', blob);
      let data: any = await this.pouchdbService.getDoc(animal._id);
      let attachments = data._attachments;
      animal._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(animal);
  }

  deleteAnimal(animal) {
    return this.pouchdbService.deleteDoc(animal);
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  getWorksPage(animal_id, skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/AnimalDiario', 4,
        [animal_id + "z"],
        [animal_id],
        true,
        true,
        15,
        skip
      ).then(async (planneds: any[]) => {
        console.log("planned", planneds);
        let getList = [];
        planneds.forEach(item => {
          getList.push(item.key[3]);
        })
        let docs: any = await this.pouchdbService.getList(getList, true);
        let moves = [];
        docs.forEach(row => {
          moves.push(row.doc);
        })
        resolve(moves);
      });
    });
  }
}
