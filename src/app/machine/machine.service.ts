import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MachineService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) { }

  getMachine(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let machine: any = await this.pouchdbService.getDoc(doc_id, true);
      if (machine._attachments && machine._attachments['avatar.png']) {
        let avatar = machine._attachments['avatar.png'].data;
        machine.image = "data:image/png;base64," + avatar;
      } else {
        machine.image = "./assets/icons/field.jpg";
      }
      resolve(machine);
    });
  }

  getMachineReview(doc_id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.pouchdbService.getViewInv(
        'Informes/Revisao', 2,
        [doc_id, 'z'],
        [doc_id, '0'],
        true,
        true,
        1
      ).then(async (reviews: any[]) => {
        if (reviews.length) {
          resolve({
            date: reviews[0].key[1],
            quantity: reviews[0].value
          });
        } else {
          resolve(false)
        }
      });
    });
  }

  createMachine(viewData, blob = undefined) {
    let machine = Object.assign({}, viewData);
    machine.docType = 'machine';
    delete machine.moves;
    delete machine.machine;
    delete machine.image;
    return new Promise((resolve, reject) => {
      if (machine.code && machine.code != '') {
        this.pouchdbService.createDoc(machine).then(doc => {
          resolve({ doc: doc, machine: machine });
        });
      } else {
        this.configService.getSequence('machine').then((code) => {
          machine['code'] = code;
          this.pouchdbService.createDoc(machine).then(async doc => {
            if (blob) {
              let avai = await this.pouchdbService.attachFile(doc['id'], 'avatar.png', blob);
            }
            resolve({ doc: doc, machine: machine });
          });
        });
      }
    });
  }

  async updateMachine(viewData, blob = undefined) {
    let machine = Object.assign({}, viewData);
    machine.docType = 'machine';
    delete machine.moves;
    delete machine.machine;
    delete machine.image;
    if (blob) {
      await this.pouchdbService.attachFile(machine._id, 'avatar.png', blob);
      let data: any = await this.pouchdbService.getDoc(machine._id);
      let attachments = data._attachments;
      machine._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(machine);
  }

  deleteMachine(machine) {
    return this.pouchdbService.deleteDoc(machine);
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  getWorksPage(machine_id, skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(today.getDate()+1);
      let day = tomorrow.toISOString().split("T")[0];
      this.pouchdbService.getViewInv(
        'Informes/MachineDiario', 1,
        [machine_id, day],
        [machine_id, "0"],
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

  getWorksPageAll(machine_id, skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(today.getDate()+1);
      let day = tomorrow.toISOString().split("T")[0];
      this.pouchdbService.getViewInv(
        'Informes/MachineDiarioAll', 1,
        [machine_id, day],
        [machine_id, "0"],
        false,
        true,
        15,
        skip,
        true
      ).then(async (machines: any[]) => {
        resolve(machines);
      });
    });
  }

  getScheduledTasks(machine_id, skip = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(today.getDate()+1);
      let day = tomorrow.toISOString().split("T")[0];
      this.pouchdbService.getViewInv(
        'Informes/MachineDiario', 1,
        [machine_id, "z"],
        [machine_id, day],
        false,
        true,
        15,
        skip,
        true
      ).then(async (machines: any[]) => {
        resolve(machines);
      });
    });
  }
}
