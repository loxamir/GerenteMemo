import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams, ViewController, ModalController, Events, PopoverController} from '@ionic/angular';
import { AccountCategoryPage } from '../accountCategory';
import 'rxjs/Rx';
import { AccountCategorysService } from './accountCategorys.service';
import { AccountCategorysPopover } from './accountCategorys.popover';

@Component({
  selector: 'accountCategorys-page',
  templateUrl: 'accountCategorys.html'
})
export class AccountCategorysPage {
  accountCategorys: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  has_search = false;
  filter: string = 'all';

  constructor(
    public navCtrl: NavController,
    public app: App,
    public accountCategorysService: AccountCategorysService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public modal: ModalController,
    public navParams: NavParams,
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.get('select');
    if (this.select){
      this.has_search = true;
    }
    this.filter = this.navParams.get('filter')||'all';
  }

  ionViewDidLoad() {
    this.loading.present();
    this.startFilteredItems();
  }
  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }
  startFilteredItems() {
    //console.log("setFilteredItems");
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.accountCategorysService.getAccountCategorysPage(this.searchTerm, 0, filter).then((accountCategorys: any[]) => {
      console.log("this.filter", this.filter);
      this.accountCategorys = accountCategorys;

      this.page = 1;
      this.loading.dismiss();
    });
  }
  setFilteredItems() {
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.accountCategorysService.getAccountCategorysPage(this.searchTerm, 0, filter).then((accountCategorys: any[]) => {
        this.accountCategorys = accountCategorys;
      // this.accountCategorys = accountCategorys;
      this.page = 1;
    });
  }
  // setFilteredItems() {
  //   if (this.searchTerm == ""){
  //     this.accountCategorysService.getAccountCategorysPage(this.searchTerm, 0).then((accountCategorys) => {
  //       this.accountCategorys = accountCategorys;
  //     });
  //   } else {
  //     console.log("search", this.searchTerm);
  //     let selector = {
  //       "$and": [
  //         {
  //           "$or": [
  //             {code: { $regex: RegExp(this.searchTerm, "i") }},
  //             {name: { $regex: RegExp(this.searchTerm, "i") }},
  //             {document: { $regex: RegExp(this.searchTerm, "i") }},
  //           ]
  //         },
  //         {docType: 'accountCategory'},
  //       ]
  //     }
  //     let sort = [ {'_id' : 'desc'} ];
  //     this.accountCategorysService.searchAccountCategorys(selector, sort).then((accountCategorys) => {
  //       console.log("accountCategorys", accountCategorys);
  //       this.accountCategorys = accountCategorys;
  //     });
  //   }
  // }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.accountCategorysService.getAccountCategorysPage(this.searchTerm, this.page).then((accountCategorys: any[]) => {
        // this.accountCategorys = accountCategorys
        accountCategorys.forEach(accountCategory => {
          this.accountCategorys.push(accountCategory);
        });
        this.page += 1;
      });
      infiniteScroll.complete();
    }, 200);
  }
  doRefresh(refresher) {
    setTimeout(() => {
      this.accountCategorysService.getAccountCategorysPage(this.searchTerm, 0).then((accountCategorys: any[]) => {
        if (this.filter == 'all'){
          this.accountCategorys = accountCategorys;
        }
        else if (this.filter == 'seller'){
          this.accountCategorys = accountCategorys.filter(word => word.seller == true);
        }
        else if (this.filter == 'customer'){
          this.accountCategorys = accountCategorys.filter(word => word.customer == true);
        }
        else if (this.filter == 'supplier'){
          this.accountCategorys = accountCategorys.filter(word => word.supplier == true);
        }
        else if (this.filter == 'employee'){
          this.accountCategorys = accountCategorys.filter(word => word.employee == true);
        }
        this.page = 1;
      });
      refresher.complete();
    }, 500);
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(AccountCategorysPopover);
    popover.present({
      ev: myEvent
    });
  }

  openAccountCategory(accountCategory) {
    this.events.subscribe('open-accountCategory', (data) => {
      this.events.unsubscribe('open-accountCategory');
    })
    this.navCtrl.push(AccountCategoryPage, {'_id': accountCategory._id});
  }

  selectAccountCategory(accountCategory) {
    if (this.select){
      this.navCtrl.pop().then(() => {
        this.events.publish('select-accountCategory', accountCategory);
      });
    } else {
      this.openAccountCategory(accountCategory);
    }
  }

  createAccountCategory(){
    this.events.subscribe('create-accountCategory', (data) => {
      if (this.select){
        this.navCtrl.pop().then(() => {
          this.events.publish('select-accountCategory', data);
        });
      }
      this.events.unsubscribe('create-accountCategory');
    })
    this.navCtrl.push(AccountCategoryPage, {});
  }

  deleteAccountCategory(accountCategory){
    let index = this.accountCategorys.indexOf(accountCategory)
    this.accountCategorys.splice(index, 1);
    this.accountCategorysService.deleteAccountCategory(accountCategory);
  }

}
