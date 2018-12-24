import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams,  ModalController, Events} from '@ionic/angular';
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
    
    public modal: ModalController,
    public route: ActivatedRoute,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }
  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }
  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }


  setFilteredItems() {
    this.currencyService.getCurrencyList(this.searchTerm).then(currencyList => {
      this.currencyList = currencyList;
      //this.loading.dismiss();
    });
  }

  openCurrency(currency) {
    this.events.subscribe('open-currency', (data) => {
      this.events.unsubscribe('open-currency');
    })
    this.navCtrl.navigateForward(CurrencyPage, {'_id': currency._id});
  }

  selectCurrency(currency) {
    this.navCtrl.navigateBack().then(() => {
      this.events.publish('select-currency', currency);
    });
  }

  createCurrency(){
    this.events.subscribe('create-currency', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-currency', data);
        });
      }
      this.events.unsubscribe('create-currency');
    })
    this.navCtrl.navigateForward(CurrencyPage, {});
  }

  deleteCurrency(currency){
    this.currencyService.deleteCurrency(currency);
  }

}
