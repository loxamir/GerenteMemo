import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams,  Events, ModalController } from '@ionic/angular';
// import { ViewPage } from './view';
import 'rxjs/Rx';
//import { ViewModel } from './view.model';
import { ViewService } from './view.service';

import { AccountPage } from '../../cash/move/account/account';
import { CashMovePage } from '../../cash/move/cash-move';
import { ProductPage } from '../../product/product';
import { ContactPage } from '../../contact/contact';
import { WarehousePage } from '../../stock/warehouse/warehouse';
import { StockMovePage } from '../../stock/stock-move';

@Component({
  selector: 'view-page',
  templateUrl: 'view.html'
})
export class ViewPage {
  view: any;
  loading: any;
  select: boolean;
  searchTerm: string = '';
  name: string = "Depositos";
  has_search = false;
  level: number = 1;
  startkey: any = ['0'];
  endkey: any = ['z'];
  reportView: string = 'stock/ResultadoDiario';
  filter: string = "";

  constructor(
    public navCtrl: NavController,
    public app: App,
    public viewService: ViewService,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    
    public route: ActivatedRoute,
    public events: Events,
  ) {
    console.log("nav", this.navParams.data.reportView);
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.reportView = this.navParams.data.reportView || this.reportView;
    this.level = this.navParams.data.level || this.level;
    this.startkey = this.navParams.data.startkey || this.startkey;
    this.endkey = this.navParams.data.endkey || this.endkey;
    this.filter = this.navParams.data.filter || this.filter;
    this.name = this.navParams.data.name
    || this.navParams.data.reportView.split('/')[1]
    || 'Depositos';
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }

  setFilteredItems() {
    this.viewService.getView(
      this.searchTerm,
      this.reportView,
      this.level,
      this.startkey,
      this.endkey
    ).then((view: any[]) => {
      if (this.filter){
        this.view = view.filter(doc => doc.doc.name == this.filter);
      } else {
        this.view = view;
      }
      //this.loading.dismiss();
    });
  }

  selectView(view) {
    let startkey = this.startkey.slice(0, this.level - 1);
    startkey.push(this.startkey[this.startkey.length -1]);
    this.startkey = startkey;
    let endkey = this.endkey.slice(0, this.level - 1);
    endkey.push(this.endkey[this.endkey.length -1]);
    this.endkey = endkey;
    this.endkey.splice(this.endkey.length -1, 0, view.key[view.key.length - 1]);
    this.startkey.splice(this.startkey.length -1, 0, view.key[view.key.length - 1]);

    this.navCtrl.navigateForward(ViewPage, {
      'reportView': this.reportView,
      'level': this.level+1,
      'startkey': this.startkey,
      'endkey': this.endkey,
      'name': this.name+"/"+view.doc.name
    });
  }


  gotoDoc(view) {
    let docView:any = false;
    switch (view.doc.docType){
      case 'account':
        docView = AccountPage;
        break;
      case 'product':
        docView = ProductPage;
        break;
      case 'contact':
        docView = ContactPage;
        break;
      case 'cash-move':
        docView = CashMovePage;
        break;
      case 'stock-move':
        docView = StockMovePage;
        break;
      case 'warehouse':
        docView = WarehousePage;
        break;
    }
    let profileModal = this.modal.create(docView, {'_id': view.doc._id});
    profileModal.present();
    // this.navCtrl.navigateForward(AccountPage, {'_id': view.doc._id});
  }


  gotoView(view) {
    this.events.subscribe('open-view', (data) => {
      this.events.unsubscribe('open-view');
      this.doRefreshList();
    })
    this.navCtrl.navigateForward(ViewPage, {'_id': view._id});
  }

  doRefreshList() {
    setTimeout(() => {
      this.viewService.getView(
        this.searchTerm,
        this.reportView,
        this.level,
        this.startkey,
        this.endkey
      ).then((view) => {
        this.view = view;
      });
    }, 500);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.viewService.getView(
        this.searchTerm,
        this.reportView,
        this.level,
        this.startkey,
        this.endkey
      ).then((view) => {
        this.view = view;
        refresher.target.complete();
      });
    }, 500);
    ////console.log('Begin async operation', refresher);
    // setTimeout(() => {
    //   ////console.log('Async operation has ended');
    //   this.productsService.getProductsPage(this.searchTerm, 0).then((products: any[]) => {
    //     ////console.log("products", products);
    //     this.products = products;
    //     this.page = 0;
    //   });
    // }, 500);
  }

  deleteView(view){
    let index = this.view.indexOf(view);
    this.view.splice(index, 1);
    this.viewService.deleteView(view);
  }

  // ionViewWillLeave(){
  //   console.log("I will leave", this.level, this.startkey, this.endkey)
  // }

}
