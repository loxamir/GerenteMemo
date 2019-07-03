import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController,   Events, ModalController } from '@ionic/angular';
// import { ViewPage } from './view';
import 'rxjs/Rx';
//import { ViewModel } from './view.model';
import { ViewService } from './view.service';

import { AccountPage } from '../account/account.page';
import { CashMovePage } from '../cash-move/cash-move.page';
import { ProductPage } from '../product/product.page';
import { ContactPage } from '../contact/contact.page';
import { WarehousePage } from '../warehouse/warehouse.page';
import { StockMovePage } from '../stock-move/stock-move.page';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.page.html',
  styleUrls: ['./view-report.page.scss'],
})
export class ViewReportPage implements OnInit {
  view: any;
  loading: any;
  select;
  searchTerm: string = '';
  name: string = "Depositos";
  level: number = 1;
  startkey: any = ['0'];
  endkey: any = ['z'];
  reportView: string = 'stock/ResultadoDiario';
  filter: string = "";
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public pouchdbService: PouchdbService,
    public viewService: ViewService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,

    public route: ActivatedRoute,
    public events: Events,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.reportView = this.route.snapshot.paramMap.get('reportView') || this.reportView;
    this.level = parseInt(this.route.snapshot.paramMap.get('level')) || this.level;
    this.startkey = (this.route.snapshot.paramMap.get('startkey') || '0').split(',') || this.startkey;
    this.endkey = (this.route.snapshot.paramMap.get('endkey')|| 'z').split(',') || this.endkey;
    this.filter = this.route.snapshot.paramMap.get('filter') || this.filter;
    this.name = this.route.snapshot.paramMap.get('name')
    || this.route.snapshot.paramMap.get('reportView').split('/')[1]
    || 'Depositos';
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.setFilteredItems();
  }

  setFilteredItems() {
    let startkey = this.startkey;
    let endkey = this.endkey;
    this.viewService.getView(
      this.searchTerm,
      this.reportView,
      this.level,
      startkey,
      endkey
    ).then((view: any[]) => {
      // console.log("view", view);
      if (this.filter){
        this.view = view.filter(doc => doc.doc.name == this.filter);
      } else {
        this.view = view;
      }
      this.loading.dismiss();
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
    this.navCtrl.navigateForward(['/view-report', {
      'reportView': this.reportView,
      'level': this.level+1,
      'startkey': this.startkey,
      'endkey': this.endkey,
      'name': this.name+"/"+view.doc.name
    }]);
  }


  async gotoDoc(view) {
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
    let profileModal = await this.modalCtrl.create({
      component: docView,
      componentProps: {
        'select': true,
        '_id': view.doc._id,
      }
    });
    profileModal.present();
  }


  async gotoView(view) {
    this.events.subscribe('open-view', (data) => {
      this.events.unsubscribe('open-view');
      this.doRefreshList();
    })
    this.navCtrl.navigateForward(['/view-report', {'_id': view._id}]);
  }

  async doRefreshList() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    setTimeout(() => {
      this.viewService.getView(
        this.searchTerm,
        this.reportView,
        this.level,
        this.startkey,
        this.endkey
      ).then((view) => {
        this.view = view;
        this.loading.dismiss();
      });
    }, 500);
  }

  async doRefresh(refresher) {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    setTimeout(() => {
      this.viewService.getView(
        this.searchTerm,
        this.reportView,
        this.level,
        this.startkey,
        this.endkey
      ).then((view) => {
        this.view = view;
        this.loading.dismiss();
        refresher.target.complete();
      });
    }, 500);
  }

  deleteView(view){
    let index = this.view.indexOf(view);
    this.view.splice(index, 1);
    this.viewService.deleteView(view);
  }

}
