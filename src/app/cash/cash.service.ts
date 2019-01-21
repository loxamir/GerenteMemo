import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
import { CashMoveService } from '../cash-move/cash-move.service';

@Injectable({
  providedIn: 'root'
})
export class CashService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    public cashMoveService: CashMoveService,
  ) {}


  getCash(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      ////console.log("getPlanned");
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Caixas', 2,
        [doc_id, '0'],
        [doc_id, 'z']
      ).then((planneds: any[]) => {
        // console.log("Caixas", planneds);
        let promise_ids = [];
        let pts = [];
        let balance = 0;
        planneds.forEach(item => {
          // if (item.value != 0){
            pts.push(item);
            // console.log("ites", item);
            promise_ids.push(this.cashMoveService.getCashMove(item.key[1]));
            balance += parseFloat(item.value);
          // }
        })
        promise_ids.push(this.pouchdbService.getDoc(doc_id));
        Promise.all(promise_ids).then(cashMoves => {
          // resolve(pts);
          // console.log("cashMoves", cashMoves);
          // let cash = ;
          let cash = Object.assign({}, cashMoves[cashMoves.length-1]);
          cash.moves = [];
          cash.balance = balance;
          cash.account = cashMoves[cashMoves.length-1];
          // cash.name
          cash.waiting = [];
          for(let i=0;i<pts.length;i++){
            if (cashMoves[i].state == 'WAITING'){
              cash.waiting.unshift(cashMoves[i]);
            } else {
              cash.moves.unshift(cashMoves[i]);
            }
            // console.log(cashMoves[i].value);
          }
          // console.log("PTS2", cash);
          // let receivables = pts.filter(word => word['contact_name'] && word['contact_name'].toString().search(new RegExp(keyword, "i")) != -1);
          this.pouchdbService.getDoc(cash.currency_id).then(currency=>{
            cash.currency = currency;
            resolve(cash);
          })
        })
      });
    });
  }

  createCash(cash){
    cash.docType = 'account';
    delete cash.moves;
    delete cash.cash;
    return new Promise((resolve, reject)=>{
      // if (cash.code && cash.code != ''){
      //   this.pouchdbService.createDoc(cash).then(doc => {
      //     if (cash.type == 'cash'){
      //       cash._id = "account.cash."+cash.code;
      //     }
      //     else if (cash.type == 'bank'){
      //       cash._id = "account.bank."+cash.code;
      //     }
      //     else if (cash.type == 'check'){
      //       cash._id = "account.check."+cash.code;
      //     }
      //     resolve({doc: doc, cash: cash});
      //   });
      // } else {
        this.configService.getSequence('cash').then((code) => {
          // let code = cash['code'];
          cash['code'] = code;
          if (cash.type == 'cash'){
            cash._id = "account.cash."+cash.code;
          }
          else if (cash.type == 'bank'){
            cash._id = "account.bank."+cash.code;
          }
          else if (cash.type == 'check'){
            cash._id = "account.check."+cash.code;
          }
          this.pouchdbService.createDoc(cash).then(doc => {
            resolve({doc: doc, cash: cash});
          });
        });
      // }

    });
  }

  getDefaultCash(){
    return new Promise((resolve, reject)=>{
      this.configService.getConfigDoc().then(config => {
        this.pouchdbService.getDoc(config.cash_id).then(default_cash => {
          resolve(default_cash);
        })
      });
    });
  }

  updateCash(viewData){
    let cash = Object.assign({}, viewData);
    cash.docType = 'account';
    delete cash.moves;
    delete cash.cash;
    if (cash.currency){
      cash.currency_id = cash.currency._id;
    }
    delete cash.currency;
    return this.pouchdbService.updateDoc(cash);
  }

  deleteCash(cash){
    return this.pouchdbService.deleteDoc(cash);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  localHandleChangeData(moves, waiting, change){
    let changedDoc = null;
    let changedState = false;
    let changedIndex = null;
      let list = waiting;
      list.forEach((doc, index) => {
        if(doc._id === change.id){
          changedDoc = doc;
          changedIndex = index;
          if (doc.state == 'WAITING' && change.doc.state == 'DONE'){
            changedState = true;
          }
        }
      });

      //A document was deleted
      if(change.deleted){
        list.splice(changedIndex, 1);
      } else if(changedState){
        list.splice(changedIndex, 1);
        changedState = false;
      }
      else {
        //A document was updated
        if(changedDoc){
          list[changedIndex] = change.doc;
        }
        //A document was added
        else {
          list.unshift(change.doc);
        }
      }
      changedDoc = null;
      changedState = false;
      changedIndex = null;
      list = moves;
      list.forEach((doc, index) => {
        if(doc._id === change.id){
          changedDoc = doc;
          changedIndex = index;
          if (doc.state == 'DONE' && change.doc.state == 'WAITING'){
            changedState = true;
          }
        }
      });

      //A document was deleted
      if(change.deleted){
        list.splice(changedIndex, 1);
      } else if(changedState){
        list.splice(changedIndex, 1);
        changedState = false;
      }
      else {
        //A document was updated
        if(changedDoc){
          list[changedIndex] = change.doc;
        }
        //A document was added
        else {
          list.unshift(change.doc);
        }
      }
  }
}
