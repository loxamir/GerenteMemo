import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class CashListService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getCashList(keyword, page){
    return new Promise((resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Caixas', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        let cashiers = [];
        this.pouchdbService.searchDocTypeData(
          'account', keyword
        ).then((cashList: any[]) => {
          cashList.forEach(cashier=>{
            cashier.balance = 0;
            if (cashier._id.split('.')[1] == 'cash' || cashier._id.split('.')[1] == 'check' || cashier._id.split('.')[1] == 'bank'){
              let cashReport = planneds.filter(x => x.key[0]==cashier._id)[0]
              cashier.balance = cashReport && cashReport.value || 0;
              cashiers.push(cashier);
            }
          })
          resolve(cashiers);
        });
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Caixas', 1,
      ['0'],
      ['z']
    ).then((cashiers: any[]) => {
      let cashierDict = {}
      cashiers.forEach(item=>{
        cashierDict[item.key[0]] = item.value;
      })
      list.forEach((cashier, index)=>{
        if (
          change.doc.accountFrom_id == cashier._id
          || change.doc.accountTo_id == cashier._id
        ){
          cashier.balance = cashierDict[cashier._id] || 0;
        }
      })
    });
  }

  deleteCash(cash) {
    return this.pouchdbService.deleteDoc(cash);
  }
}
