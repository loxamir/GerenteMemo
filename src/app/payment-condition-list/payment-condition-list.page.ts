import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { NavController, LoadingController,   ModalController, Events} from '@ionic/angular';
import { PaymentConditionPage } from '../payment-condition/payment-condition.page';
import 'rxjs/Rx';
// import { PaymentConditionService } from '../payment-condition.service';

@Component({
  selector: 'app-payment-condition-list',
  templateUrl: './payment-condition-list.page.html',
  styleUrls: ['./payment-condition-list.page.scss'],
})
export class PaymentConditionListPage implements OnInit {
  paymentConditionList: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  has_search = false;

  constructor(
    public navCtrl: NavController,
    // public paymentConditionService: PaymentConditionService,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
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
  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
  }


  setFilteredItems() {
    this.getPaymentConditionList(this.searchTerm).then(paymentConditionList => {
      this.paymentConditionList = paymentConditionList;
      //this.loading.dismiss();
    });
  }

  getPaymentConditionList(keyword){
    return this.pouchdbService.searchDocTypeData('payment-condition');
  }

  openPaymentCondition(paymentCondition) {
    this.events.subscribe('open-payment-condition', (data) => {
      this.events.unsubscribe('open-payment-condition');
    })
    this.navCtrl.navigateForward(['/payment-condition', {'_id': paymentCondition._id}]);
  }

  selectPaymentCondition(paymentCondition) {
    // this.navCtrl.navigateBack().then(() => {
      this.events.publish('select-payment-condition', paymentCondition);
    // });
  }

  createPaymentCondition(){
    this.events.subscribe('create-payment-condition', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-payment-condition', data);
        // });
      }
      this.events.unsubscribe('create-payment-condition');
    })
    this.navCtrl.navigateForward(['/payment-condition', {}]);
  }

  deletePaymentCondition(paymentCondition) {
    return this.pouchdbService.deleteDoc(paymentCondition);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 200);
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.setFilteredItems();
      infiniteScroll.target.complete();
    }, 50);
  }
}
