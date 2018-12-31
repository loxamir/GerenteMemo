import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController,   Events } from '@ionic/angular';
// import { AccountPage } from '../account';
import 'rxjs/Rx';
//import { AccountsModel } from './accounts.model';
// import { AccountsService } from './accounts.service';

// import { PlannedListPage } from '../../../../planned/list/planned-list';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.page.html',
  styleUrls: ['./account-list.page.scss'],
})
export class AccountListPage implements OnInit {
  accounts: any;
  loading: any;
  select;
  searchTerm: string = '';
  page = 0;
  show_cash_in;
  show_cash_out;
  field:any = null;
  filter:any = null;

  constructor(
    public navCtrl: NavController,
    // public app: App,
    // public accountsService: AccountsService,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.show_cash_in = this.route.snapshot.paramMap.get('show_cash_in');
    this.show_cash_out = this.route.snapshot.paramMap.get('show_cash_out');
    if (this.show_cash_in){
      this.field = null;
      this.filter = "cash_in";
    } else if (this.show_cash_out){
      this.field = null;
      this.filter = "cash_out";
    } else if (this.route.snapshot.paramMap.get('receivable')){
      this.field = null;
      this.filter = "receivable";
    } else if (this.route.snapshot.paramMap.get('payable')){
      this.field = null;
      this.filter = "payable";
    }
    if (this.route.snapshot.paramMap.get('transfer')){
      this.field = null;
      this.filter = "transfer";
    }
  }

  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getAccounts(
        this.searchTerm, this.page, this.field, this.filter
      ).then((accounts: any[]) => {
        if (this.filter == 'transfer'){
          accounts = accounts.filter(word=> word._id != this.route.snapshot.paramMap.get('accountFrom')['_id']);
        }
        accounts.forEach(account => {
          this.accounts.push(account);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 0);
  }

  setFilteredItems() {
    this.getAccounts(
      this.searchTerm, 0, this.field, this.filter
    ).then((accounts: any) => {
      if (this.filter == 'transfer'){
        accounts = accounts.filter(word=> word._id != this.route.snapshot.paramMap.get('accountFrom')['_id']);
      }
      this.accounts = accounts;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  selectAccount(accounts) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-account', accounts);
      // });
    } else {
      this.gotoAccount(accounts);
    }

    this.events.subscribe('open-account', (data) => {
      this.events.unsubscribe('open-account');
    })
  }

  gotoAccount(accounts) {
    this.events.subscribe('open-account', (data) => {
      this.events.unsubscribe('open-account');
    })
    this.navCtrl.navigateForward(['/account', {'_id': accounts._id}]);
  }

  createAccount(){
    this.events.subscribe('create-account', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-account', data);
        // });
      }
      this.events.unsubscribe('create-account');
    })
    this.navCtrl.navigateForward(['/account', {}]);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

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

}