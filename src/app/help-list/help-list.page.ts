import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController,   ModalController, Events} from '@ionic/angular';
// import { HelpPage } from '../help';
import 'rxjs/Rx';
// import { HelpsService } from './helps.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-help-list',
  templateUrl: './help-list.page.html',
  styleUrls: ['./help-list.page.scss'],
})
export class HelpListPage implements OnInit {
  helps: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  has_search = false;
  filter: string = 'all';

  constructor(
    public navCtrl: NavController,
    // public helpsService: HelpsService,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public modal: ModalController,
    public route: ActivatedRoute,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    if (this.select){
      this.has_search = true;
    }
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
  }

  ngOnInit() {
    //this.loading.present();
    this.startFilteredItems();
  }
  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }
  startFilteredItems() {
    //console.log("setFilteredItems");
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.getHelpsPage(this.searchTerm, 0, filter).then((helps: any[]) => {
      console.log("this.filter", this.filter);
      this.helps = helps;

      this.page = 1;
      //this.loading.dismiss();
    });
  }
  setFilteredItems() {
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.getHelpsPage(this.searchTerm, 0, filter).then((helps: any[]) => {
        this.helps = helps;
      // this.helps = helps;
      this.page = 1;
    });
  }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getHelpsPage(this.searchTerm, this.page).then((helps: any[]) => {
        // this.helps = helps
        helps.forEach(help => {
          this.helps.push(help);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 200);
  }
  doRefresh(refresher) {
    setTimeout(() => {
      this.getHelpsPage(this.searchTerm, 0).then((helps: any[]) => {
        if (this.filter == 'all'){
          this.helps = helps;
        }
        else if (this.filter == 'seller'){
          this.helps = helps.filter(word => word.seller == true);
        }
        else if (this.filter == 'customer'){
          this.helps = helps.filter(word => word.customer == true);
        }
        else if (this.filter == 'supplier'){
          this.helps = helps.filter(word => word.supplier == true);
        }
        else if (this.filter == 'employee'){
          this.helps = helps.filter(word => word.employee == true);
        }
        this.page = 1;
      });
      refresher.target.complete();
    }, 500);
  }

  openHelp(help) {
    this.events.subscribe('open-help', (data) => {
      this.events.unsubscribe('open-help');
    })
    this.navCtrl.navigateForward(['/help', {'_id': help._id}]);
  }

  selectHelp(help) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-help', help);
      // });
    } else {
      this.openHelp(help);
    }
  }

  createHelp(){
    this.events.subscribe('create-help', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-help', data);
        // });
      }
      this.events.unsubscribe('create-help');
    })
    this.navCtrl.navigateForward(['/help', {}]);
  }

  getHelpsPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData('help', keyword, page, "document", field).then((helps: any[]) => {
        resolve(helps);
      });
    });
  }

  deleteHelp(help) {
    return this.pouchdbService.deleteDoc(help);
  }

}
