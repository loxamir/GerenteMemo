import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, PopoverController, Events } from '@ionic/angular';
import { InvoicePage } from '../invoice/invoice.page';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
// import { InvoicesService } from './invoices.service';
// import { InvoicesPopover } from './invoices.popover';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.page.html',
  styleUrls: ['./invoice-list.page.scss'],
})
export class InvoiceListPage implements OnInit {
  invoices: any;
  loading: any;
  searchTerm: string = '';
  page = 0;
  select;
  languages: Array<LanguageModel>;
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public route: ActivatedRoute,
    public events: Events,
    public translate: TranslateService,
    public languageService: LanguageService,
  ) {
    
    
    
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-invoice', (change)=>{
      this.handleChange(this.invoices, change);
    })
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((invoices) => {
      // console.log("sinvoice", invoices);
      this.invoices = invoices;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getInvoicesPage(
        this.searchTerm, this.page
      ).then((invoices: any[]) => {
        invoices.forEach(invoice => {
          this.invoices.push(invoice);
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

  async ngOnInit() {
  let language = navigator.language.split('-')[0];
  this.translate.setDefaultLang(language);
  this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.getInvoicesPage(
      this.searchTerm, 0
    ).then((invoices) => {
      this.invoices = invoices;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openInvoice(invoice) {
    this.events.subscribe('open-invoice', (data) => {
      this.events.unsubscribe('open-invoice');
    })
    // this.navCtrl.navigateForward(InvoicePage,{'_id': invoice._id});
    // console.log("invoice.id", invoice._id);
    this.navCtrl.navigateForward(['/invoice', {'_id': invoice._id}]);
  }

  createInvoice(fab){
    this.events.subscribe('create-invoice', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-invoice', data);
        // });
      }
      this.events.unsubscribe('create-invoice');
    })
    // this.navCtrl.navigateForward(InvoicePage, {});
    this.navCtrl.navigateForward(['/invoice', {}]);
    fab.close()
  }

  createInvoiceIn(fab){
    this.events.subscribe('create-invoice', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-invoice', data);
        // });
      }
      this.events.unsubscribe('create-invoice');
    })
    this.navCtrl.navigateForward(['/invoice', {'type': 'in'}]);
    fab.close()
  }

  getInvoicesPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'invoice', keyword, page, "number"
      ).then((invoices: any[]) => {
        resolve(invoices);
      });
    });
  }

  deleteInvoice(invoice){
    return this.pouchdbService.deleteDoc(invoice);
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'invoice',
      keyword,
      page,
      "contact_name"
    ).then((invoices) => {
        resolve(invoices);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}
