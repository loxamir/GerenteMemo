import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams, ViewController, ModalController, Events} from '@ionic/angular';
import { CurrencyPage } from '../currency';
import 'rxjs/Rx';
import { CurrencyService } from '../currency.service';

@Component({
  selector: 'currency-list-page',
  templateUrl: 'currency-list.html'
})
export class CurrencyListPage {
  currencyList: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  has_search = false;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public currencyService: CurrencyService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public modal: ModalController,
    public navParams: NavParams,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.get('select');
  }
  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }
  ionViewDidLoad() {
    this.loading.present();
    this.setFilteredItems();
  }


  setFilteredItems() {
    this.currencyService.getCurrencyList(this.searchTerm).then(currencyList => {
      this.currencyList = currencyList;
      this.loading.dismiss();
    });
  }

  openCurrency(currency) {
    this.events.subscribe('open-currency', (data) => {
      this.events.unsubscribe('open-currency');
    })
    this.navCtrl.push(CurrencyPage, {'_id': currency._id});
  }

  selectCurrency(currency) {
    this.navCtrl.pop().then(() => {
      this.events.publish('select-currency', currency);
    });
  }

  createCurrency(){
    this.events.subscribe('create-currency', (data) => {
      if (this.select){
        this.navCtrl.pop().then(() => {
          this.events.publish('select-currency', data);
        });
      }
      this.events.unsubscribe('create-currency');
    })
    this.navCtrl.push(CurrencyPage, {});
  }

  deleteCurrency(currency){
    this.currencyService.deleteCurrency(currency);
  }

}
