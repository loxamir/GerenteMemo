import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PersonService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) { }


  getPerson(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let person: any = await this.pouchdbService.getDoc(doc_id, true);
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/ContactDiario', 4,
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
        if (person._attachments && person._attachments['avatar.png']) {
          let avatar = person._attachments['avatar.png'].data;
          person.image = "data:image/png;base64," + avatar;
        } else {
          person.image = "./assets/icons/field.jpg";
        }
        resolve(person);
      });
    });
  }

  getPersonRain(doc_id): Promise<any> {
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

  createPerson(viewData, blob = undefined) {
    let person = Object.assign({}, viewData);
    person.docType = 'contact';
    delete person.moves;
    delete person.person;
    delete person.image;
    return new Promise((resolve, reject) => {
      if (person.code && person.code != '') {
        this.pouchdbService.createDoc(person).then(doc => {
          resolve({ doc: doc, person: person });
        });
      } else {
        this.configService.getSequence('contact').then((code) => {
          person['code'] = code;
          this.pouchdbService.createDoc(person).then(async doc => {
            if (blob) {
              console.log("blob", doc);
              let avai = await this.pouchdbService.attachFile(doc['id'], 'avatar.png', blob);
            }
            resolve({ doc: doc, person: person });
          });
        });
      }

    });
  }

  async updatePerson(viewData, blob = undefined) {
    let person = Object.assign({}, viewData);
    person.docType = 'person';
    delete person.moves;
    delete person.person;
    delete person.image;
    if (blob) {
      await this.pouchdbService.attachFile(person._id, 'avatar.png', blob);
      let data: any = await this.pouchdbService.getDoc(person._id);
      let attachments = data._attachments;
      person._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(person);
  }

  deletePerson(person) {
    return this.pouchdbService.deleteDoc(person);
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  getWorksPage(person_id, skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/ContactDiario', 4,
        [person_id + "z"],
        [person_id],
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
