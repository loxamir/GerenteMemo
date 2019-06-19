import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, Events } from '@ionic/angular';
import { CheckPage } from '../check/check.page';
import 'rxjs/Rx';
import { CheckListService } from './check-list.service';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.page.html',
  styleUrls: ['./check-list.page.scss'],
})
export class CheckListPage implements OnInit {
  checks: any;
  loading: any;
  select;
  searchTerm: string = '';
  page = 0;
  currency_precision = 2;
  languages: Array<LanguageModel>;
  field:any = null;
  filter:any = '';
  company_currency_id = 'currency.PYG';
  currencies = {};

  constructor(
    public navCtrl: NavController,
    // public app: App,
    public checkListService: CheckListService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public events: Events,
    public languageService: LanguageService,
    public translate: TranslateService,
    // public navParams: NavParams,
  ) {
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
    this.select = this.route.snapshot.paramMap.get('select');
    this.field = this.route.snapshot.paramMap.get('field') || null;
    this.filter = this.route.snapshot.paramMap.get('filter') || '';
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.company_currency_id = config.currency_id;
    let pyg = await this.pouchdbService.getDoc('currency.PYG')
    let usd = await this.pouchdbService.getDoc('currency.USD')
    this.currencies = {
      "currency.PYG": pyg,
      "currency.USD": usd,
    }
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.checkListService.getChecks(this.searchTerm, this.page, this.field, this.filter).then((checks: any[]) => {
        checks.forEach(check => {
          this.checks.push(check);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      console.log("this.field, this.filter)", this.field, this.filter);
      this.checkListService.getChecks(this.searchTerm, 0, this.field, this.filter).then((checks: any[]) => {
        this.checks = checks;
      });
      this.page = 1;
      refresher.target.complete();
    }, 200);
  }

  setFilteredItems() {
    this.checkListService.getChecks(this.searchTerm, 0, this.field, this.filter).then((checks) => {
      this.checks = checks;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doRefreshList() {
    setTimeout(() => {
      this.checkListService.getChecks(this.searchTerm, 0, this.field, this.filter).then((checks: any[]) => {
        this.checks = checks;
        this.page = 1;
      });
    }, 200);
  }

  selectCheck(check) {
    if (this.select){
      this.modalCtrl.dismiss();
      this.events.publish('select-check', check);
    } else {
      this.openCheck(check);
    }
  }

  async openCheck(check) {
    console.log("openCheck", this.select);
    this.events.subscribe('open-check', (data) => {
      this.events.unsubscribe('open-check');
      // this.doRefreshList();
    })
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: CheckPage,
        componentProps: {
          select: true,
          '_id': check._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/check', {'_id': check._id}]);
    }
  }

  async createCheck(){
    this.events.subscribe('create-check', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-check', data);
          this.modalCtrl.dismiss()
        // });
      }
      this.events.unsubscribe('create-check');
      // this.doRefreshList();
    })
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: CheckPage,
        componentProps: {
          select: true
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/check', {}]);
    }
  }
}
