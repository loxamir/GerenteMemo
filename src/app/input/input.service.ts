import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
// import { InputMoveService } from './move/input-move.service';

@Injectable()
export class InputService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    // public inputMoveService: InputMoveService,
  ) {}


  getInput(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Inputs', 2,
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
        Promise.all(promise_ids).then(inputMoves => {
          let input = Object.assign({}, inputMoves[inputMoves.length-1]);
          input.moves = [];
          input.balance = balance;
          input.account = inputMoves[inputMoves.length-1];
          input.name
          for(let i=0;i<pts.length;i++){
            input.moves.unshift(inputMoves[i]);
          }
          resolve(input);
        })
      });
    });
  }

  createInput(viewData){
    let input = Object.assign({}, viewData);
    input.docType = 'input';
    delete input.moves;
    return new Promise((resolve, reject)=>{
      if (input.code && input.code != ''){
        this.pouchdbService.createDoc(input).then(doc => {
          resolve({doc: doc, area: input});
        });
      } else {
        this.configService.getSequence('input').then((code) => {
          input['code'] = code;
          this.pouchdbService.createDoc(input).then(doc => {
            resolve({doc: doc, input: input});
          });
        });
      }
    });
  }

  getDefaultInput(){
    return new Promise((resolve, reject)=>{
      this.configService.getConfigDoc().then(config => {
        this.pouchdbService.getDoc(config.input_id).then(default_input => {
          resolve(default_input);
        })
      });
    });
  }

  updateInput(input){
    input.docType = 'account';
    delete input.moves;
    delete input.input;
    return this.pouchdbService.updateDoc(input);
  }

  deleteInput(input){
    return this.pouchdbService.deleteDoc(input);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
