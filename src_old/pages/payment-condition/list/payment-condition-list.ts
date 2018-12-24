import { Component } from '@angular/core';
import { NavController, App, LoadingController,   ModalController, Events} from '@ionic/angular';
import { PaymentConditionPage } from '../payment-condition';
import 'rxjs/Rx';
import { PaymentConditionService } from '../payment-condition.service';

@Component({
  selector: 'payment-condition-list-page',
  templateUrl: 'payment-condition-list.html'
})
export class PaymentConditionListPage {
  paymentConditionList: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  has_search = false;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public paymentConditionService: PaymentConditionService,
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
    this.paymentConditionService.getPaymentConditionList(this.searchTerm).then(paymentConditionList => {
      this.paymentConditionList = paymentConditionList;
      //this.loading.dismiss();
    });
  }

  openPaymentCondition(paymentCondition) {
    this.events.subscribe('open-payment-condition', (data) => {
      this.events.unsubscribe('open-payment-condition');
    })
    this.navCtrl.navigateForward(PaymentConditionPage, {'_id': paymentCondition._id});
  }

  selectPaymentCondition(paymentCondition) {
    this.navCtrl.navigateBack().then(() => {
      this.events.publish('select-payment-condition', paymentCondition);
    });
  }

  createPaymentCondition(){
    this.events.subscribe('create-payment-condition', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-payment-condition', data);
        });
      }
      this.events.unsubscribe('create-payment-condition');
    })
    this.navCtrl.navigateForward(PaymentConditionPage, {});
  }

  deletePaymentCondition(paymentCondition){
    let index = this.paymentConditionList.indexOf(paymentCondition);
    this.paymentConditionList.splice(index, 1);
    this.paymentConditionService.deletePaymentCondition(paymentCondition);
  }

}
