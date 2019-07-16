import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class InputService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) { }


  getInput(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let input: any = await this.pouchdbService.getDoc(doc_id, true);
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/InputDiario', 4,
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
        if (input._attachments && input._attachments['avatar.png']) {
          let avatar = input._attachments['avatar.png'].data;
          input.image = "data:image/png;base64," + avatar;
        } else {
          input.image = "./assets/icons/field.jpg";
        }
        resolve(input);
      });
    });
  }

  getInputRain(doc_id): Promise<any> {
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

  createInput(viewData, blob = undefined) {
    let input = Object.assign({}, viewData);
    input.docType = 'product';
    delete input.moves;
    delete input.input;
    delete input.image;
    return new Promise((resolve, reject) => {
      if (input.code && input.code != '') {
        this.pouchdbService.createDoc(input).then(doc => {
          resolve({ doc: doc, input: input });
        });
      } else {
        this.configService.getSequence('product').then((code) => {
          input['code'] = code;
          this.pouchdbService.createDoc(input).then(async doc => {
            if (blob) {
              console.log("blob", doc);
              let avai = await this.pouchdbService.attachFile(doc['id'], 'avatar.png', blob);
            }
            resolve({ doc: doc, input: input });
          });
        });
      }

    });
  }

  async updateInput(viewData, blob = undefined) {
    let input = Object.assign({}, viewData);
    input.docType = 'input';
    delete input.moves;
    delete input.input;
    delete input.image;
    if (blob) {
      await this.pouchdbService.attachFile(input._id, 'avatar.png', blob);
      let data: any = await this.pouchdbService.getDoc(input._id);
      let attachments = data._attachments;
      input._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(input);
  }

  deleteInput(input) {
    return this.pouchdbService.deleteDoc(input);
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  getWorksPage(input_id, skip = 0, warehouse_id = 'warehouse.physical.my'): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let payableList = [];
      this.pouchdbService.getViewInv(
        'stock/InputDiario', 5,
        [input_id, warehouse_id+"z"],
        [input_id, warehouse_id],
        true,
        true,
        15,
        skip
      ).then(async (planneds: any[]) => {
        console.log("planned", planneds);
        let getList = [];
        planneds.forEach(item => {
          getList.push(item.key[4]);
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
