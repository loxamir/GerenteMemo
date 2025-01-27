import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import {
  NavController, LoadingController, ModalController, Events,
  PopoverController
 } from '@ionic/angular';
import { AccountPage } from '../account/account.page';
import 'rxjs/Rx';
import { AccountListPopover} from './account-list.popover';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";

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
  receivable;
  payable;
  transfer;
  user:any = {};

  constructor(
    public navCtrl: NavController,
    public languageService: LanguageService,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public popoverCtrl: PopoverController,
    public events: Events,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.show_cash_in = this.route.snapshot.paramMap.get('show_cash_in');
    this.show_cash_out = this.route.snapshot.paramMap.get('show_cash_out');
    this.receivable = this.route.snapshot.paramMap.get('receivable');
    this.payable = this.route.snapshot.paramMap.get('payable');
    this.transfer = this.route.snapshot.paramMap.get('transfer');
  }

  async ngOnInit() {
  let language:any = await this.languageService.getDefaultLanguage();
  this.translate.setDefaultLang(language);
  this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.user = (await this.pouchdbService.getUser());
    if (this.transfer){
      this.field = null;
      this.filter = "transfer";
    } else if (this.show_cash_in){
      this.field = null;
      this.filter = "cash_in";
    } else if (this.show_cash_out){
      this.field = null;
      this.filter = "cash_out";
    } else if (this.receivable){
      this.field = null;
      this.filter = "receivable";
    } else if (this.payable){
      this.field = null;
      this.filter = "payable";
    }
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getAccounts(
        this.searchTerm, this.page, this.field, this.filter
      ).then((accounts: any[]) => {
        accounts.forEach(account => {
          this.accounts.push(account);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 0);
  }

  async presentPopover(myEvent) {
    // console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: AccountListPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  setFilteredItems() {
    // console.log("this.filter", this.filter);
    this.getAccounts(
      this.searchTerm, 0, this.field, this.filter
    ).then((accounts: any) => {
      this.accounts = accounts;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  selectAccount(account) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-account', account);
        this.modalCtrl.dismiss();
      // });
    } else {
      this.openAccount(account);
    }

    this.events.subscribe('open-account', (data) => {
      this.events.unsubscribe('open-account');
    })
  }

  async openAccount(account) {
    this.events.subscribe('open-account', (data) => {
      this.events.unsubscribe('open-account');
    })
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: AccountPage,
        componentProps: {
          "select": true,
          "_id": account._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/account', {'_id': account._id}]);
    }
  }

  async createAccount(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: AccountPage,
        componentProps: {
          "select": true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/account', {}]);
    }
    this.events.subscribe('create-account', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-account', data);
        // });
      }
      this.events.unsubscribe('create-account');
    })
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  deleteAccount(account) {
    let index = this.accounts.indexOf(account);
    this.accounts.slice(index, 1)
    return this.pouchdbService.deleteDoc(account);
  }

  getAccounts(keyword, page, field, filter){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.searchDocTypeData(
      'account', keyword, page, field, filter
    ).then((accounts: any[]) => {
        let promise_ids = [];
        accounts.forEach(account => {
          promise_ids.push(this.pouchdbService.getDoc(account.category_id));
        });
        Promise.all(promise_ids).then(balances => {
          for(let i=0;i<balances.length;i++){
            accounts[i].category = balances[i];
          }
          resolve(accounts);
        });
      });
    });
  }

}
