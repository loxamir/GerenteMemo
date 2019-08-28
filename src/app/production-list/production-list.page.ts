import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, PopoverController , Events, NavParams  } from '@ionic/angular';
import 'rxjs/Rx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductionListPopover} from './production-list.popover';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'app-production-list',
  templateUrl: './production-list.page.html',
  styleUrls: ['./production-list.page.scss'],
})
export class ProductionListPage implements OnInit {
  productions: any = [];
  loading: any;
  searchTerm: string = '';
  items = [];
  page = 0;
  select;
  languages: Array<LanguageModel>;
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
  ) {



    this.select = this.route.snapshot.paramMap.get('select')  ;
    this.events.subscribe('changed-production', (change)=>{
      this.handleChange(this.productions, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((productions) => {
      // console.log("productions", productions);
      this.productions = productions;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getProductionsPage(
        this.searchTerm, this.page
      ).then((productions: any[]) => {
        productions.forEach(production => {
          this.productions.push(production);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getProductionsPage(
        this.searchTerm, 0
      ).then((productions: any[]) => {
        this.productions = productions;
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: ProductionListPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
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

  setFilteredItems() {
    this.getProductionsPage(this.searchTerm, 0).then((productions) => {
      this.productions = productions;
      this.loading.dismiss();
      this.page = 1;
    });
  }

  openProduction(production) {
    this.events.subscribe('open-production', (data) => {
      this.events.unsubscribe('open-production');
    })
    this.navCtrl.navigateForward(['/production', {'_id': production._id}]);
  }

  createProduction(){
    this.events.subscribe('create-production', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-production', data);
        // });
      }
      this.events.unsubscribe('create-production');
    })
    this.navCtrl.navigateForward(['/production', {'production': true,}]);
  }

  getProductionsPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'production', keyword, page, "contact_name"
      ).then((productions: any[]) => {
        resolve(productions);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  deleteProduction(production){
    return this.pouchdbService.deleteDoc(production);
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'production',
      keyword,
      page,
      "contact_name"
    ).then((productions) => {
        resolve(productions);
      })
    })
  }

}
