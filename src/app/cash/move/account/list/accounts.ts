import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams, ViewController, Events } from '@ionic/angular';
import { AccountPage } from '../account';
import 'rxjs/Rx';
//import { AccountsModel } from './accounts.model';
import { AccountsService } from './accounts.service';

import { PlannedListPage } from '../../../../planned/list/planned-list';

@Component({
  selector: 'accounts-page',
  templateUrl: 'accounts.html'
})
export class AccountsPage {
  accounts: any;
  loading: any;
  select: boolean;
  searchTerm: string = '';
  page = 0;
  show_cash_in = false;
  show_cash_out = false;
  field:any = null;
  filter:any = null;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public accountsService: AccountsService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.data.select;
    this.show_cash_in = this.navParams.data.show_cash_in;
    this.show_cash_out = this.navParams.data.show_cash_out;
    if (this.show_cash_in){
      this.field = null;
      this.filter = "cash_in";
    } else if (this.show_cash_out){
      this.field = null;
      this.filter = "cash_out";
    } else if (this.navParams.data.receivable){
      this.field = null;
      this.filter = "receivable";
    } else if (this.navParams.data.payable){
      this.field = null;
      this.filter = "payable";
    }
    if (this.navParams.data.transfer){
      this.field = null;
      this.filter = "transfer";
    }
  }

  ionViewDidLoad() {
    this.loading.present();
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.accountsService.getAccounts(
        this.searchTerm, this.page, this.field, this.filter
      ).then((accounts: any[]) => {
        if (this.filter == 'transfer'){
          accounts = accounts.filter(word=> word._id != this.navParams.data.accountFrom._id);
        }
        accounts.forEach(account => {
          this.accounts.push(account);
        });
        this.page += 1;
      });
      infiniteScroll.complete();
    }, 0);
  }

  setFilteredItems() {
    this.accountsService.getAccounts(
      this.searchTerm, 0, this.field, this.filter
    ).then((accounts: any) => {
      if (this.filter == 'transfer'){
        accounts = accounts.filter(word=> word._id != this.navParams.data.accountFrom._id);
      }
      this.accounts = accounts;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  selectAccount(accounts) {
    if (this.select){
      this.navCtrl.pop().then(() => {
        this.events.publish('select-account', accounts);
      });
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
    this.navCtrl.push(AccountPage, {'_id': accounts._id});
  }

  createAccount(){
    this.events.subscribe('create-account', (data) => {
      if (this.select){
        this.navCtrl.pop().then(() => {
          this.events.publish('select-account', data);
        });
      }
      this.events.unsubscribe('create-account');
    })
    this.navCtrl.push(AccountPage, {});
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.complete();
    }, 50);
  }

  deleteAccount(account){
    let index = this.accounts.indexOf(account);
    this.accounts.splice(index, 1);
    this.accountsService.deleteAccount(account);
  }

}
