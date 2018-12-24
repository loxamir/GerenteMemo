import { Component } from '@angular/core';
import { NavController, App, LoadingController, PopoverController , Events, NavParams  } from '@ionic/angular';
import { ServicePage } from '../service';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
import { ServicesService } from './services.service';
import { ServicesPopover } from './services.popover';

@Component({
  selector: 'services-page',
  templateUrl: 'services.html'
})
export class ServicesPage {
  services: any;
  loading: any;
  searchTerm: string = '';
  items = [];
  page = 0;
  select: boolean;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public servicesService: ServicesService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select')  ;
    this.events.subscribe('changed-service', (change)=>{
      this.servicesService.handleChange(this.services, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  searchItems() {
    this.servicesService.searchItems(
      this.searchTerm, 0
    ).then((services) => {
      console.log("services", services);
      this.services = services;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.servicesService.getServicesPage(this.searchTerm, this.page).then((services: any[]) => {
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
      this.servicesService.getServicesPage(this.searchTerm, 0).then((services: any[]) => {
        this.services = services;
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(ServicesPopover);
    popover.present({
      ev: myEvent
    });
  }

  getMonth(month) {
    if (month == '01'){
      return "Enero";
    } else if (month == '02'){
      return "Febrero";
    } else if (month == '03'){
      return "Marzo";
    } else if (month == '04'){
      return "Abril";
    } else if (month == '05'){
      return "Mayo";
    } else if (month == '06'){
      return "Junio";
    } else if (month == '07'){
      return "Julio";
    } else if (month == '08'){
      return "Agosto";
    } else if (month == '09'){
      return "Septiembre";
    } else if (month == '10'){
      return "Octubre";
    } else if (month == '11'){
      return "Noviembre";
    } else if (month == '12'){
      return "Diciembre";
    }
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }
  // startFilteredItems() {
  //   this.servicesService.getServicesPage(this.searchTerm, 0).then((services) => {
  //     this.services = services;
  //     //this.loading.dismiss();
  //     this.page = 1;
  //   });
  // }

  setFilteredItems() {
    this.servicesService.getServicesPage(this.searchTerm, 0).then((services) => {
      this.services = services;
      //this.loading.dismiss();
      this.page = 1;
    });
    // if (this.searchTerm == ""){
    //   this.servicesService.getServicesPage(this.searchTerm, 0).then((services) => {
    //     this.services = services;
    //   });
    // } else {
    //   let selector = {
    //     "$and": [
    //       {
    //         "$or": [
    //           {code: { $regex: RegExp(this.searchTerm, "i") }},
    //           {contact_name: { $regex: RegExp(this.searchTerm, "i") }},
    //         ]
    //       },
    //       {docType: 'service'},
    //     ]
    //   }
    //   let sort = [ {'_id' : 'desc'} ];
    //   this.servicesService.searchServices(selector, sort).then((services) => {
    //     this.services = services;
    //   });
    // }
  }

  openService(service) {
    this.events.subscribe('open-service', (data) => {
      this.events.unsubscribe('open-service');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ServicePage, {'_id': service._id});
  }

  createService(fab){
    this.events.subscribe('create-service', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-service', data);
        });
      }
      this.events.unsubscribe('create-service');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ServicePage, {});
    fab.close();
  }

  createProduction(fab){
    this.events.subscribe('create-service', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-service', data);
        });
      }
      this.events.unsubscribe('create-service');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ServicePage, {
      'production': true,
    });
    fab.close();
  }

  deleteService(service){
    let index = this.services.indexOf(service);
    this.services.splice(index, 1);
    this.servicesService.deleteService(service);
  }
}
