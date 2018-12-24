import { Component } from '@angular/core';
import { NavController, App, LoadingController, PopoverController, Events, NavParams } from '@ionic/angular';
import { InvoicePage } from '../invoice';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
import { InvoicesService } from './invoices.service';
import { InvoicesPopover } from './invoices.popover';

@Component({
  selector: 'invoices-page',
  templateUrl: 'invoices.html'
})
export class InvoicesPage {
  invoices: any;
  loading: any;
  searchTerm: string = '';
  page = 0;
  select: boolean;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public invoicesService: InvoicesService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public route: ActivatedRoute,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-invoice', (change)=>{
      this.invoicesService.handleChange(this.invoices, change);
    })
  }

  searchItems() {
    this.invoicesService.searchItems(
      this.searchTerm, 0
    ).then((invoices) => {
      console.log("sinvoice", invoices);
      this.invoices = invoices;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.invoicesService.getInvoicesPage(
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

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(InvoicesPopover);
    popover.present({
      ev: myEvent
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.invoicesService.getInvoicesPage(
      this.searchTerm, 0
    ).then((invoices) => {
      this.invoices = invoices;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  openInvoice(invoice) {
    this.events.subscribe('open-invoice', (data) => {
      this.events.unsubscribe('open-invoice');
    })
    this.navCtrl.navigateForward(InvoicePage,{'_id': invoice._id});
  }

  createInvoice(fab){
    this.events.subscribe('create-invoice', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-invoice', data);
        });
      }
      this.events.unsubscribe('create-invoice');
    })
    this.navCtrl.navigateForward(InvoicePage, {});
    fab.close()
  }

  createInvoiceIn(fab){
    this.events.subscribe('create-invoice', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-invoice', data);
        });
      }
      this.events.unsubscribe('create-invoice');
    })
    this.navCtrl.navigateForward(InvoicePage, {'type': 'in'});
    fab.close()
  }

  deleteInvoice(invoice){
    let index = this.invoices.indexOf(invoice);
    this.invoices.splice(index, 1);
    this.invoicesService.deleteInvoice(invoice);
  }
}
