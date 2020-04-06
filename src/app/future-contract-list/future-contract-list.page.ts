import { Component, OnInit } from '@angular/core';
import {
  NavController, LoadingController, PopoverController, Events,
  NavParams, ModalController
} from '@ionic/angular';
import 'rxjs/Rx';
import { File } from '@ionic-native/file/ngx';
import { FutureContractPage } from '../future-contract/future-contract.page';
// import { FutureContractsService } from './future-contracts.service';
import { FutureContractsPopover } from './future-contract-list.popover';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { FormatService } from '../services/format.service';
import { SalePage } from '../sale/sale.page';

@Component({
  selector: 'app-future-contract-list',
  templateUrl: './future-contract-list.page.html',
  styleUrls: ['./future-contract-list.page.scss'],
})
export class FutureContractListPage implements OnInit {
  futureContracts: any = [];
  loading: any;
  searchTerm: string = '';
  page = 0;
  languages: Array<LanguageModel>;
  currency_precision = 2;
  select;
  selecting=false;

  constructor(
    public navCtrl: NavController,
    public formatService: FormatService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public file: File,
    public pouchdbService: PouchdbService,
    public languageService: LanguageService,
    public modalCtrl: ModalController,
    public translate: TranslateService,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-future-contract', (change)=>{
      this.handleChange(this.futureContracts, change);
    })
    this.events.subscribe('got-database', (change)=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getFutureContractsPage(
        this.searchTerm,
        this.page
      ).then((futureContracts: any[]) => {
        futureContracts.forEach(futureContract => {
          this.futureContracts.push(futureContract);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  async getSummary(){
    let quantity = 0;
    let amount = 0;
    this.futureContracts.forEach(variable => {
        amount += parseFloat(variable.price)*parseFloat(variable.quantity);
        quantity += parseFloat(variable.quantity);
    });
    this.quantity = quantity;
    this.amount = amount;
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 200);
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: FutureContractsPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  selectItem(item){
    item.selected = !item.selected;
    let selecteds = this.futureContracts.filter(word=>word.selected);
    if (selecteds.length){
      this.selecting = true;
    } else {
      this.selecting = false;
    }
  }

  async createSale() {
    let selecteds = this.futureContracts.filter(word=>word.selected);
    let contact_id = selecteds[0].contact_id;
    let contactError = false;
    selecteds.forEach(row=>{
      if (row.contact_id != contact_id){
        console.log("cliente diferente");
        contactError = true;
      }
    })
    if (contactError){
      return;
    }
    var getList = selecteds.map( function( elem ) {
      return elem.product_id
    });
    getList.push(selecteds[0].contact_id);
    getList.push(selecteds[0].warehouse_id);
    getList.push(selecteds[0].crop_id);
    let docs:any = await this.pouchdbService.getList(getList);
    var doc_dict = {};
    docs.forEach(row=>{
      doc_dict[row.id] = row.doc;
    })
    var items = selecteds.map(function( elem ) {
      return {
        'quantity': elem.delivered+elem.settled-elem.sold,
        'price': elem.price - elem.cost,
        'product': doc_dict[elem.product_id],
        'contract_id': elem._id,
      };
    });
    let profileModal = await this.modalCtrl.create({
      component: SalePage,
      componentProps: {
        "select": true,
        contact: doc_dict[selecteds[0].contact_id],
        crop: doc_dict[selecteds[0].crop_id],
        warehouse: doc_dict[selecteds[0].warehouse_id],
        items: items
      }
    })
    profileModal.present();
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    await this.setFilteredItems();
  }

  setFilteredItems() {
    this.getFutureContractsPage(
      this.searchTerm, 0
    ).then((futureContracts) => {
      this.futureContracts = futureContracts;
      this.page = 1;
      this.loading.dismiss();
      this.getSummary();
    });
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((futureContracts) => {
      this.futureContracts = futureContracts;
      this.page = 1;
      // this.loading.dismiss();
    });
  }

  // async openFutureContract(futureContract) {
  //   this.events.subscribe('open-future-contract', (data) => {
  //     this.events.unsubscribe('open-future-contract');
  //   })
  //   this.loading = await this.loadingCtrl.create({});
  //   await this.loading.present();
  //   await this.navCtrl.navigateForward(['/future-contract', {'_id': futureContract._id}]);
  //   await this.loading.dismiss();
  // }

  selectFutureContract(futureContract) {
    if (this.select) {
      this.modalCtrl.dismiss();
      this.events.publish('select-future-contract', futureContract);
    } else {
      this.openFutureContract(futureContract);
    }
  }

  async openFutureContract(futureContract) {
    this.events.subscribe('open-future-contract', (data) => {
      this.events.unsubscribe('open-future-contract');
    })
    if (this.select) {
      let profileModal = await this.modalCtrl.create({
        component: FutureContractPage,
        componentProps: {
          "select": true,
          "_id": futureContract._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/future-contract', { '_id': futureContract._id }]);
      await this.loading.dismiss();
    }
  }

  async createFutureContract(){
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    await this.navCtrl.navigateForward(['/future-contract', {}]);
    await this.loading.dismiss();
  }

  getFutureContractsPage(keyword, page){
    return new Promise(async resolve => {
      let futureContracts:any = await this.pouchdbService.searchDocTypeData(
        'future-contract',
        keyword,
        page,
        "contact_name"
      );//.then((futureContracts: any[]) => {
      await this.formatService.asyncForEach(futureContracts, async item=>{
      // futureContracts.forEach(async item=> {
        let deliveries:any = await this.pouchdbService.getView(
          'Informes/EntregasLista', 1,
          [item._id],
          [item._id+"z"],
        );//.then((view: any[]) => {})
        item.delivered = deliveries[0] && deliveries[0].value || 0;
        console.log("deliveries", deliveries, item);

        let sales:any = await this.pouchdbService.getView(
          'Informes/VentasContratoLista', 1,
          [item._id],
          [item._id+"z"],
        );//.then((view: any[]) => {})
        item.sold = sales[0] && sales[0].value || 0;
        console.log("sold", sales, item);

      })
      console.log("futureContract", futureContracts);



        resolve(futureContracts);
      // });
    });
  }

  deleteFutureContract(slidingItem, futureContract){
    slidingItem.close();
    return this.pouchdbService.deleteDoc(futureContract);
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'future-contract',
      keyword,
      page,
      "contact_name"
    ).then((futureContracts) => {
        resolve(futureContracts);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}
