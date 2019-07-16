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

  constructor(
    public navCtrl: NavController,
    // public futureContractsService: FutureContractsService,
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
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
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

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 200);
  }

  async presentPopover(myEvent) {
    // console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: FutureContractsPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  async ngOnInit() {
    //this.loading.present();
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.getFutureContractsPage(
      this.searchTerm, 0
    ).then((futureContracts) => {
      this.futureContracts = futureContracts;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((futureContracts) => {
      this.futureContracts = futureContracts;
      this.page = 1;
      this.loading.dismiss();
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
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'future-contract',
        keyword,
        page,
        "contact_name"
      ).then((futureContracts: any[]) => {
        resolve(futureContracts);
      });
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
