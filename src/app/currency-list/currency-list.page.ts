import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController,   ModalController, Events} from '@ionic/angular';
import 'rxjs/Rx';
import { CurrencyPage } from '../currency/currency.page';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.page.html',
  styleUrls: ['./currency-list.page.scss'],
})
export class CurrencyListPage implements OnInit {
  currencyList: any;
  loading: any;
  select;
  searchTerm: string = '';
  // has_search = false;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }
  // setSearch() {
  //   if (this.has_search){
  //     this.searchTerm = "";
  //     this.setFilteredItems();
  //   }
  //   this.has_search = ! this.has_search;
  // }
  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
  }

  searchItems(){
    this.setFilteredItems();
  }


  setFilteredItems() {
    this.getCurrencyList(this.searchTerm).then(currencyList => {
      this.currencyList = currencyList;
      //this.loading.dismiss();
    });
  }


  async openCurrency(currency) {
    console.log("open", currency);
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: CurrencyPage,
        componentProps: {
          "select": true,
          "_id": currency._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/currency', {'_id': currency._id}]);
    }
    this.events.subscribe('open-currency', (data) => {
      this.events.unsubscribe('open-currency');
    })
  }

  selectCurrency(currency) {
    // this.navCtrl.navigateBack().then(() => {
    if (this.select){
      console.log("select", currency);
      this.events.publish('select-currency', currency);
      this.modalCtrl.dismiss();
    } else {
      this.openCurrency(currency);
    }
    // });
  }

  async createCurrency(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: CurrencyPage,
        componentProps: {
          "select": true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/currency', {}]);
    }
    this.events.subscribe('create-currency', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-currency', data);
          this.modalCtrl.dismiss();
        // });
      }
      this.events.unsubscribe('create-currency');
    })
  }

  // deleteCurrency(currency){
  //   this.deleteCurrency(currency);
  // }

  deleteCurrency(currency) {
    return this.pouchdbService.deleteDoc(currency);
  }

  getCurrencyList(keyword){
    return this.pouchdbService.searchDocTypeData('currency');
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.setFilteredItems();
      infiniteScroll.target.complete();
    }, 50);
  }


}
