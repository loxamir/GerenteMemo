import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, PopoverController , Events,  ModalController  } from '@ionic/angular';
// import { PurchasePage } from '../purchase';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
// import { PurchasesService } from './purchases.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { PurchaseListPopover} from './purchase-list.popover';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.page.html',
  styleUrls: ['./purchase-list.page.scss'],
})
export class PurchaseListPage implements OnInit {
  purchases: any = [];
  loading: any;
  searchTerm: string = '';
  page = 0;
  select;
  field = "contact";
  criteria = "=";
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    // public app: App,
    // public purchasesService: PurchasesService,
    public translate: TranslateService,
    public languageService: LanguageService,
    public menu: MenuController,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public modal: ModalController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-purchase', (change)=>{
      this.handleChange(this.purchases, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  openMenu() {
    console.log("asdfasdf");
    this.menu.open();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getPurchases(
        this.searchTerm, this.page
      ).then((purchases: any[]) => {
        purchases.forEach(purchase => {
          this.purchases.push(purchase);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((purchases) => {
      console.log("purchases", purchases);
      this.purchases = purchases;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getPurchases(
        this.searchTerm, 0
      ).then((purchases: any[]) => {
        this.purchases = purchases;
      });
      this.page = 1;
      refresher.target.complete();
    }, 50);
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(PurchasesPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: PurchaseListPopover,
      event: myEvent,
      componentProps: {message: 'asdf', popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.getPurchases(
      this.searchTerm, 0
    ).then((purchases) => {
      this.purchases = purchases;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openPurchase(purchase) {
    this.events.subscribe('open-purchase', (data) => {
      this.events.unsubscribe('open-purchase');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(PurchasePage, {'_id': purchase._id});
    this.navCtrl.navigateForward(['/purchase', {'_id': purchase._id}]);
  }

  createPurchase(){
    this.events.subscribe('create-purchase', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-purchase', data);
        // });
      }
      this.events.unsubscribe('create-purchase');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(PurchasePage, {});
    this.navCtrl.navigateForward(['/purchase', {}]);
  }

  getPurchases(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'purchase', keyword, page, "contact_name"
      ).then((purchases: any[]) => {
        resolve(purchases);
      });
    });
  }

  deletePurchase(purchase){
    return this.pouchdbService.deleteDoc(purchase);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'purchase',
      keyword,
      page,
      "contact_name"
    ).then((purchases) => {
        resolve(purchases);
      })
    })
  }
}
