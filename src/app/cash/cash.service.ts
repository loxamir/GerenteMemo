import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
import { CashMoveService } from '../cash-move/cash-move.service';
import { FormatService } from '../services/format.service';

@Injectable({
  providedIn: 'root'
})
export class CashService {

  lastMove = "z";

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    public cashMoveService: CashMoveService,
    public formatService: FormatService,
  ) {}


  getCash(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getView(
        'Informes/CaixasPagina', 6,
        [doc_id+"z"],
        [doc_id],
        true,
        true,
        15,
        undefined,
        false,
        undefined,
        true,
      ).then(async (planneds: any[]) => {
        console.log("planneds", planneds);
        if (planneds.length){
          this.lastMove = planneds[planneds.length - 1].key[0].split(doc_id)[1];
        }
        let promise_ids = [];
        let pts = [];
        let getList = [];
        planneds.forEach(item => {
          if (!item.key[3] || item.key[4] == doc_id){
            pts.push(item);
            getList.push(item.key && item.key[5]);
          }
        })
        getList.push(doc_id);
        this.pouchdbService.getList(getList).then(async (cashMoves:any) => {
          let docDict = {}
          cashMoves.forEach(item=>{
            docDict[item.id] = item.doc;
          })
          let balance:any;
          let currency_balance:any;
          let cash = Object.assign({}, docDict[doc_id]);
          cash.moves = [];
          balance = await this.pouchdbService.getView(
            'stock/Caixas', 1, [doc_id, null], [doc_id, "z"]);
          cash.balance = balance[0] && balance[0].value || 0;

          if (cash.currency_id){
            currency_balance = await this.pouchdbService.getView(
              'stock/CaixasForeing', 1, [doc_id, null], [doc_id, "z"]);
            cash.currency_balance = currency_balance[0] && currency_balance[0].value || 0;
          }
          cash.account = cash;
          cash.waiting = [];
          // let waitingBalance = 0;
          if (cash.type == 'check'){
            let checks:any = await this.pouchdbService.getView('Informes/Cheques', 5, [doc_id], [doc_id+"z"], false, true, undefined, undefined, true);
            let checks2 = checks.sort((a, b) => {
              return this.formatService.compareField(a.doc, b.doc, 'write_date', 'increase');
            })
            cash.checks = checks2 || [];
          }
          for(let i=0;i<pts.length;i++){
            if (cash.type == 'bank'){
              if (cashMoves[i].doc.state == 'WAITING'){
                if (pts[i] && pts[i].key && docDict[pts[i].key[5]]){
                  cash.waiting.unshift(pts[i] && pts[i].key && docDict[pts[i].key[5]]);
                }
              } else {
                if (pts[i] && pts[i].key && docDict[pts[i].key[5]]){
                  cash.moves.unshift(pts[i] && pts[i].key && docDict[pts[i].key[5]]);
                }
              }
            } else {
              if (pts[i] && pts[i].key && docDict[pts[i].key[5]]){
                cash.moves.unshift(pts[i] && pts[i].key && docDict[pts[i].key[5]]);
              }
            }
          }
          if (cash.currency_id){
            let currency:any = await this.pouchdbService.getDoc(cash.currency_id);
            cash.currency = currency;
          }
          this.pouchdbService.getRelated(
          "close", "cash_id", doc_id).then((planned) => {
            cash.closes = planned;
            resolve(cash);
          });
        })
      });
    });
  }

  loadMoves(doc_id, cash){
    return new Promise((resolve, reject)=>{
    this.pouchdbService.getView(
      'Informes/CaixasPagina', 6,
      [doc_id+this.lastMove],
      [doc_id],
      true,
      true,
      15,
      undefined,
      false,
      undefined,
      true,
    ).then(async (planneds: any[]) => {
      if (planneds.length){
        this.lastMove = planneds[planneds.length - 1].key[0].split(doc_id)[1];
      }
      let promise_ids = [];
      let pts = [];
      let getList = [];
      planneds.forEach(item => {
        if (!item.key[3] || item.key[4] == doc_id){
          pts.push(item);
          getList.push(item.key && item.key[5]);
        }
      })
      getList.push(doc_id);
      this.pouchdbService.getList(getList).then(async (cashMoves:any) => {
        let docDict = {}
        cashMoves.forEach(item=>{
          docDict[item.id] = item.doc;
        })
        for(let i=0;i<pts.length;i++){
          if (cash.type == 'bank'){
            if (cashMoves[i].doc.state == 'WAITING'){
              // if (pts[i] && pts[i].key && docDict[pts[i].key[5]]){
              //   cash.waiting.unshift(pts[i] && pts[i].key && docDict[pts[i].key[5]]);
              // }
            } else {
              if (pts[i] && pts[i].key && docDict[pts[i].key[5]]){
                cash.moves.unshift(pts[i] && pts[i].key && docDict[pts[i].key[5]]);
              }
            }
          } else {
            if (pts[i] && pts[i].key && docDict[pts[i].key[5]]){
              cash.moves.unshift(pts[i] && pts[i].key && docDict[pts[i].key[5]]);
            }
          }
        }
        resolve(true)
      })
    })
    })
  }

  createCash(cash){
    cash.docType = 'account';
    delete cash.moves;
    delete cash.cash;
    return new Promise((resolve, reject)=>{
        this.configService.getSequence('cash').then((code) => {
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
    // console.log("lslolo", change);
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
      // console.log("change.doc", change.doc);
      if (change.doc.close_id){
        // console.log("changed with close_id");
        list.splice(changedIndex, 1);
      }
  }

  localHandleCheckChange(checks, change){
    // console.log("lsloloCheck", change, checks);
    let changedDoc = null;
    let changedState = false;
    let changedIndex = null;
    let list = checks;
    list.forEach((doc, index) => {
      // console.log("doc.id", doc.id, change.id);
      if(doc.id === change.id){
        // console.log("es igual");
        changedDoc = doc;
        changedIndex = index;
        if (change.doc.state == 'DEPOSITED'){
          // To use when deposit the check
          changedState = true;
          // console.log("muda estado");
        }
      }
    });
    //A document was deleted
    if(change.deleted){
      // console.log("deleted", changedIndex);
      list.splice(changedIndex, 1);

    } else if(changedState){
      // console.log("changedState", changedIndex);
      list.splice(changedIndex, 1);
      changedState = false;
    }
    else {
      // console.log("other");
      //A document was updated
      if(changedDoc){
        list[changedIndex] = change;
      }
      //A document was added
      else {
        list.unshift(change);
      }
    }
  }

  handleSumatoryChange(sumatory, cashForm, change){
    if (change.doc._rev[0] == '1'){
      if (JSON.stringify(cashForm.value.currency) == "{}"){
        if (change.doc.accountTo_id == cashForm.value._id){
          sumatory += change.doc.amount
        }
        if (change.doc.accountFrom_id == cashForm.value._id){
          sumatory -= change.doc.amount
        }
      } else {
        if (change.doc.accountTo_id == cashForm.value._id){
          sumatory += change.doc.currency_amount
        }
        if (change.doc.accountFrom_id == cashForm.value._id){
          sumatory -= change.doc.currency_amount
        }
      }
      cashForm.patchValue({
        balance: sumatory
      })
    }
  }
}
