import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { NavController, LoadingController,   ModalController } from '@ionic/angular';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { Events } from '../services/events';

@Component({
  selector: 'app-payment-condition-list',
  templateUrl: './payment-condition-list.page.html',
  styleUrls: ['./payment-condition-list.page.scss'],
})
export class PaymentConditionListPage implements OnInit {
  paymentConditionList: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  has_search = false;

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public modal: ModalController,
    public route: ActivatedRoute,
    public languageService: LanguageService,
    public events: Events,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
  }
  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }
  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    let este = await this.pouchdbService.getConnect();
    this.setFilteredItems();
  }


  setFilteredItems() {
    this.getPaymentConditionList(this.searchTerm).then(paymentConditionList => {
      this.paymentConditionList = paymentConditionList;
    });
  }

  getPaymentConditionList(keyword){
    // return this.pouchdbService.searchDocTypeData('payment-condition');
    return new Promise(async (resolve, reject) => {
    let products_tmp:any = await this.pouchdbService.getView(
      'Informes/publishedSequence',
      undefined,
      [],
      ["z"],
      false,
      false,
      15,
      0,
      true,
    )
    console.log("products_tmp", products_tmp);
    let products = [];
    products = products_tmp.map(function(item){
      return item.doc;
    });
    resolve(products);
  })
  }

  selectPaymentCondition(paymentCondition) {
    this.modalCtrl.dismiss();
    this.events.publish('select-payment-condition', {condition: paymentCondition});
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 200);
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.setFilteredItems();
      infiniteScroll.target.complete();
    }, 50);
  }
}
