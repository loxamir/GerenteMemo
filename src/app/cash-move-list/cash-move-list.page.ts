import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { NavController,  LoadingController,  Events, PopoverController } from '@ionic/angular';
import { CashMoveListPopover } from './cash-move-list.popover';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";

@Component({
  selector: 'app-cash-move-list',
  templateUrl: './cash-move-list.page.html',
  styleUrls: ['./cash-move-list.page.scss'],
})
export class CashMoveListPage implements OnInit {
  cashMoveList: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  currency_precision = 2;

  constructor(
    public pouchdbService: PouchdbService,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public languageService: LanguageService,
    public events: Events,
    public popoverCtrl: PopoverController,
    public translate: TranslateService,
  ) {
  this.select = this.route.snapshot.paramMap.get('select');
  this.events.subscribe('changed-cash-move', (change)=>{
    this.handleChange(this.cashMoveList, change);
  })
}

  getCashMoveList(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.searchDocTypeData(
        'cash-move', keyword, page, "contact_name"
      ).then((data: any[]) => {
        resolve(data);
      }).catch((error) => {
        console.log("getCashMoveList Error:", error);
      });
    });
  }

  deleteCashMove(cashMove) {
    return this.pouchdbService.deleteDoc(cashMove);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.setFilteredItems();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  setFilteredItems() {
    this.getCashMoveList(
      this.searchTerm, 0
    ).then((cashMoveList) => {
      this.cashMoveList = cashMoveList;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: CashMoveListPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  openCashMove(cashMove) {
    if (!this.select){
      this.events.subscribe('open-cash-move', (data) => {
        this.events.unsubscribe('open-cash-move');
      })
      this.navCtrl.navigateForward(['/cash-move', {'_id': cashMove._id}]);
    } else {
      this.selectCashMove(cashMove);
    }
  }

  selectCashMove(cashMove) {
    if (this.select){
        this.events.publish('select-cash-move', cashMove);
    } else {
      this.openCashMove(cashMove);
    }
  }

  createCashMove(){
    this.events.subscribe('create-cash-move', (data) => {
      if (this.select){
          this.events.publish('select-cash-move', data);
      }
      this.events.unsubscribe('create-cash-move');
    })
    this.navCtrl.navigateForward(['/cash-move', {}]);
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getCashMoveList(
        this.searchTerm, this.page
      ).then((cashMoveList: any[]) => {
        cashMoveList.forEach(cashMove => {
          this.cashMoveList.push(cashMove);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

}
