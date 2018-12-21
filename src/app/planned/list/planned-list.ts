import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams, ViewController, ModalController, Events, AlertController } from '@ionic/angular';
import 'rxjs/Rx';
import { PlannedService } from './planned-list.service';
import { ReceiptPage } from '../../receipt/receipt';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';
import { CashMovePage } from '../../cash/move/cash-move';

@Component({
  selector: 'planned-list-page',
  templateUrl: 'planned-list.html'
})
export class PlannedListPage {
  plannedList: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  amountTotal: number;
  amountPaid: number;
  contact = {};
  contact_id = "";
  today: any;
  signal: string = '+';

  constructor(
    public navCtrl: NavController,
    public app: App,
    public plannedService: PlannedService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public modal: ModalController,
    public navParams: NavParams,
    public events: Events,
    public pouchdbService: PouchdbService,
    public alertCtrl: AlertController,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.get('select');
    this.signal = this.navParams.get('signal') || '+';
    // this.contact = {"name": "Todos"};
    if (this.navParams.get('contact_id')){
      this.contact_id = this.navParams.get('contact_id');
      this.pouchdbService.getDoc(this.contact_id).then(contact=>{
        this.contact = contact;
        this.selectedContact();
      })
    }
    // this.events.subscribe('changed-cash-move', (change)=>{
    //   this.plannedService.handleChange(this.plannedList, change);
    // })
    this.today = new Date();
  }

  createReceivableMove(){
    this.pouchdbService.getDoc('account.other.open').then(openAccount=>{
      let profileModal = this.modal.create(CashMovePage, {
        "accountFrom": openAccount,
        "receivable": true,
        "contact": this.contact,
      });
      profileModal.present();
    })
  }

  createPayableMove(){
    this.pouchdbService.getDoc('account.other.open').then(openAccount=>{
      let profileModal = this.modal.create(CashMovePage, {
        "accountTo": openAccount,
        "payable": true,
        "contact": this.contact,
      });
      profileModal.present();
    })
  }

  ionViewDidLoad() {
    this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    if (this.contact_id){
      this.selectedContact();
      this.loading.dismiss();
    } else {
      if (this.signal == "+"){
        this.plannedService.getReceivables(
          this.searchTerm
        ).then((plannedList: any[]) => {
          this.plannedList = plannedList;
          this.recomputeValues();
          this.loading.dismiss();
        });
      } else {
        this.plannedService.getPayables(
          this.searchTerm
        ).then((plannedList: any[]) => {
          this.plannedList = plannedList;
          this.recomputeValues();
          this.loading.dismiss();
        });
      }
    }
  }

  informPayment(item){
    if (item.amount_paid == undefined) {
      item.amount_paid = parseFloat(item.value);
    } else {
      item.amount_paid = undefined;
    }
    this.recomputeValues();
  }

  recomputeValues(){
    let total = 0;
    let payment = 0;
    this.plannedList.forEach((item) => {
      if (item.amount_paid){
        payment = payment + parseFloat(item.amount_paid);
      }
      total = total + parseFloat(item.value);
    });
    this.amountTotal = total;
    this.amountPaid = payment;
  }

  createPayment() {
    let paidPlanneds = [];
    this.plannedList.forEach(item => {
      if (item.amount_paid > 0){
        paidPlanneds.push(item.doc);
      }
    })
    this.navCtrl.push(ReceiptPage, {
      "addPayment": true,
      "contact": this.contact,
      "account_id": "account.debtColleted",
      "name": "Cobro de Deudas",
      "items": paidPlanneds,
      "signal": this.signal,
    });
  }

  showContact(contact){
    this.navCtrl.push(PlannedListPage, {
      'contact_id': contact._id,
      'signal': this.signal,
    });
  }

  selectedContact() {
    if (this.signal == "+"){
      this.plannedService.getContactPlannedList(
        this.contact_id, this.searchTerm
      ).then((plannedListData: any[]) => {
        let plannedList = plannedListData;
          this.plannedList = plannedList;
          this.recomputeValues();
      });
    } else {
      this.plannedService.getContactPayableList(
        this.contact_id, this.searchTerm
      ).then((plannedListData: any[]) => {
          this.plannedList = plannedListData;
          this.recomputeValues();
      });
    }
  }


  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.complete();
    }, 50);
  }

}
