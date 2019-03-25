import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
// import { MachineMoveService } from './move/machine-move.service';

@Injectable()
export class MachineService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    // public machineMoveService: MachineMoveService,
  ) {}


  getMachine(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Machines', 10,
        [doc_id, '0'],
        [doc_id, 'z']
      ).then((planneds: any[]) => {
        let promise_ids = [];
        let pts = [];
        let balance = 0;
        planneds.forEach(item => {
          pts.push(item);
          promise_ids.push(this.pouchdbService.getDoc(item.key[1]));
          balance += parseFloat(item.value);
        })
        promise_ids.push(this.pouchdbService.getDoc(doc_id));
        Promise.all(promise_ids).then(machineMoves => {
          let machine = Object.assign({}, machineMoves[machineMoves.length-1]);
          machine.moves = [];
          machine.balance = balance;
          // machine.account = machineMoves[machineMoves.length-1];
          // machine.name
          for(let i=0;i<pts.length;i++){
            machineMoves[i]['line'] = pts[i];
            machine.moves.unshift(machineMoves[i]);
          }
          console.log("machine", machine);
          resolve(machine);
        })
      });
    });
  }

  createMachine(viewData){
    let machine = Object.assign({}, viewData);
    machine.docType = 'machine';
    delete machine.moves;
    return new Promise((resolve, reject)=>{
      if (machine.code && machine.code != ''){
        this.pouchdbService.createDoc(machine).then(doc => {
          resolve({doc: doc, area: machine});
        });
      } else {
        this.configService.getSequence('machine').then((code) => {
          machine['code'] = code;
          this.pouchdbService.createDoc(machine).then(doc => {
            resolve({doc: doc, machine: machine});
          });
        });
      }
    });
  }

  getDefaultMachine(){
    return new Promise((resolve, reject)=>{
      this.configService.getConfigDoc().then(config => {
        this.pouchdbService.getDoc(config.machine_id).then(default_machine => {
          resolve(default_machine);
        })
      });
    });
  }

  updateMachine(viewData){
    let machine = Object.assign({}, viewData);
    machine.docType = 'machine';
    delete machine.moves;
    delete machine.machine;
    return this.pouchdbService.updateDoc(machine);
  }

  deleteMachine(machine){
    return this.pouchdbService.deleteDoc(machine);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
