import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, Events, PopoverController} from '@ionic/angular';
import { AccountCategoryPage } from '../account-category/account-category.page';
import 'rxjs/Rx';

@Component({
  selector: 'app-account-category-list',
  templateUrl: './account-category-list.page.html',
  styleUrls: ['./account-category-list.page.scss'],
})
export class AccountCategoryListPage implements OnInit {
  accountCategorys: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  // has_search = false;
  filter: string = 'all';

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    // if (this.select){
    //   this.has_search = true;
    // }
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
  }

  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
  }
  // setSearch() {
  //   if (this.has_search){
  //     this.searchTerm = "";
  //     this.setFilteredItems();
  //   }
  //   this.has_search = ! this.has_search;
  // }
  // startFilteredItems() {
  //   //console.log("setFilteredItems");
  //   let filter = null;
  //   if (this.filter == "all"){
  //     let filter = null;
  //   } else {
  //     let filter = this.filter;
  //   }
  //   this.getAccountCategorysPage(this.searchTerm, 0, filter).then((accountCategorys: any[]) => {
  //     console.log("this.filter", this.filter);
  //     this.accountCategorys = accountCategorys;
  //     this.page = 1;
  //     //this.loading.dismiss();
  //   });
  // }
  setFilteredItems() {
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.getAccountCategorysPage(
      this.searchTerm, 0, filter
    ).then((accountCategorys: any[]) => {
      this.accountCategorys = accountCategorys;
      this.page = 1;
    });
  }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getAccountCategorysPage(
        this.searchTerm, this.page
      ).then((accountCategorys: any[]) => {
        // this.accountCategorys = accountCategorys
        accountCategorys.forEach(accountCategory => {
          this.accountCategorys.push(accountCategory);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 200);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getAccountCategorysPage(
        this.searchTerm, 0
      ).then((accountCategorys: any[]) => {
        if (this.filter == 'all'){
          this.accountCategorys = accountCategorys;
        }
        else if (this.filter == 'seller'){
          this.accountCategorys = accountCategorys.filter(
            word => word.seller == true);
        }
        else if (this.filter == 'customer'){
          this.accountCategorys = accountCategorys.filter(
            word => word.customer == true);
        }
        else if (this.filter == 'supplier'){
          this.accountCategorys = accountCategorys.filter(
            word => word.supplier == true);
        }
        else if (this.filter == 'employee'){
          this.accountCategorys = accountCategorys.filter(
            word => word.employee == true);
        }
        this.page = 1;
      });
      refresher.target.complete();
    }, 500);
  }
  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(AccountCategorysPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  async openAccountCategory(accountCategory) {
    console.log("accountCategory", accountCategory);
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: AccountCategoryPage,
        componentProps: {
          _id: accountCategory._id,
          select: true,
        }
      });
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/account-category', {
        '_id': accountCategory._id
      }]);
    }
    this.events.subscribe('open-accountCategory', (data) => {
      this.events.unsubscribe('open-accountCategory');
    })
  }

  selectAccountCategory(accountCategory) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-accountCategory', accountCategory);
      // });
    } else {
      this.openAccountCategory(accountCategory);
    }
  }

  async createAccountCategory(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: AccountCategoryPage,
        componentProps: {
          select: true,
        }
      });
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/account-category', {}]);
    }
    this.events.subscribe('create-accountCategory', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-accountCategory', data);
        // });
      }
      this.events.unsubscribe('create-accountCategory');
    })
  }

  getAccountCategorysPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'accountCategory', keyword, page, "document", field
      ).then((accountCategorys: any[]) => {
        resolve(accountCategorys);
      });
    });
  }

  deleteAccountCategory(accountCategory) {
    return this.pouchdbService.deleteDoc(accountCategory);
  }

}
