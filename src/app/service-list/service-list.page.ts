import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, PopoverController , Events, NavParams  } from '@ionic/angular';
import 'rxjs/Rx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceListPopover} from './service-list.popover';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.page.html',
  styleUrls: ['./service-list.page.scss'],
})
export class ServiceListPage implements OnInit {
  services: any = [];
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
    this.events.subscribe('changed-service', (change)=>{
      this.handleChange(this.services, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((services) => {
      //console.log("services", services);
      this.services = services;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getServicesPage(
        this.searchTerm, this.page
      ).then((services: any[]) => {
        services.forEach(service => {
          this.services.push(service);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getServicesPage(
        this.searchTerm, 0
      ).then((services: any[]) => {
        this.services = services;
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: ServiceListPopover,
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
    this.getServicesPage(this.searchTerm, 0).then((services) => {
      this.services = services;
      this.loading.dismiss();
      this.page = 1;
    });
  }

  openService(service) {
    this.events.subscribe('open-service', (data) => {
      this.events.unsubscribe('open-service');
    })
    this.navCtrl.navigateForward(['/service', {'_id': service._id}]);
  }

  createService(){
    this.events.subscribe('create-service', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-service', data);
        // });
      }
      this.events.unsubscribe('create-service');
    })
    this.navCtrl.navigateForward(['/service', {}]);
    // fab.close();
  }

  // createProduction(fab){
  //   this.events.subscribe('create-service', (data) => {
  //     if (this.select){
  //       // this.navCtrl.navigateBack().then(() => {
  //         this.events.publish('select-service', data);
  //       // });
  //     }
  //     this.events.unsubscribe('create-service');
  //   })
  //   this.navCtrl.navigateForward(['/service', {'production': true,}]);
  //   fab.close();
  // }

  getServicesPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'service', keyword, page, "contact_name"
      ).then((services: any[]) => {
        resolve(services);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  deleteService(service){
    return this.pouchdbService.deleteDoc(service);
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'service',
      keyword,
      page,
      "contact_name"
    ).then((services) => {
        resolve(services);
      })
    })
  }

}
