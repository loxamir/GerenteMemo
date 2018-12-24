import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class AccountsService {
  data: any;
  options: any = {limit : 15, startkey: "account.z", include_docs : true, descending : true, endkey: "account."};
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  // getAccounts(keyword){
  //   return this.pouchdbService.searchDocTypePage('account');
  // }

  deleteAccount(account) {
    return this.pouchdbService.deleteDoc(account);
  }

  getAccounts(keyword, page, field, filter){
    return new Promise((resolve, reject)=>{
      ////console.log("getPlanned");
      this.pouchdbService.searchDocTypeData('account', keyword, page, field, filter).then((accounts: any[]) => {
      // this.pouchdbService.searchDocTypeData('account', keyword, page=null, field='cash_in', filter=true).then((accounts: any[]) => {
      // this.pouchdbService.searchDocTypeData('account').then((accounts: any[]) => {
        console.log("real accounts", accounts);
        // resolve(accounts);
        let promise_ids = [];
        console.log("acciybts", accounts)
        accounts.forEach(account => {
          console.log("account", account);
          promise_ids.push(this.pouchdbService.getDoc(account.category_id));
        });
        Promise.all(promise_ids).then(balances => {
          for(let i=0;i<balances.length;i++){
            accounts[i].category = balances[i];
          }
          console.log("accounts", accounts);
          resolve(accounts);
        });
      });
    });
  }

  // getAccountBalance(account_id){
  //   return new Promise((resolve, reject)=>{
  //     this.pouchdbService.searchDocTypeData('cash-move', '', false).then((planneds: any[]) => {
  //       console.log("planneds", planneds);
  //       //resolve(planneds);
  //       // let promise_ids = []
  //       let balance = 0;
  //       planneds.forEach(item => {
  //         ////console.log("iitem", item);
  //         if (item.accountFrom_id == account_id){
  //           balance -= item.amount;
  //         } else if (item.accountTo_id == account_id){
  //           balance += item.amount;
  //         }
  //       })
  //       console.log("balance", balance);
  //       resolve(balance);
  //       // Promise.all(promise_ids).then(contacts => {
  //       //   for(let i=0;i<planneds.length;i++){
  //       //     planneds[i].contact = contacts[i];
  //       //   }
  //       //   ////console.log("planneds", planneds);
  //       //   planneds.forEach(item => {
  //       //     item.date = new Date(item.date);
  //       //   });
  //       //   let result = this.groupByName(planneds, 'contact_id', 'amount');
  //       //   console.log("result", result);
  //       //   resolve(result);
  //       // })
  //     });
  //   });
  // }
}
