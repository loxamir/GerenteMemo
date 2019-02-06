import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, Events, AlertController } from '@ionic/angular';
import 'rxjs/Rx';
import { PlannedService } from './planned.service';
import { ReceiptPage } from '../receipt/receipt.page';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { CashMovePage } from '../cash-move/cash-move.page';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'app-planned-list',
  templateUrl: './planned-list.page.html',
  styleUrls: ['./planned-list.page.scss'],
})
export class PlannedListPage implements OnInit {
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
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    // public app: App,
    public plannedService: PlannedService,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public events: Events,
    public pouchdbService: PouchdbService,
    public alertCtrl: AlertController,
  ) {
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.select = this.route.snapshot.paramMap.get('select');
    this.signal = this.route.snapshot.paramMap.get('signal') || '+';
    // this.contact = {"name": "Todos"};
    if (this.route.snapshot.paramMap.get('contact_id')){
      this.contact_id = this.route.snapshot.paramMap.get('contact_id');
      this.pouchdbService.getDoc(this.contact_id).then(contact=>{
        this.contact = contact;
        this.selectedContact();
      })
    }
    this.events.subscribe('changed-cash-move', (change)=>{
      this.plannedService.handleChange(this.plannedList || [], change);
    })
    this.today = new Date();
  }

  createReceivableMove(){
    this.pouchdbService.getList([
      'account.other.open',
      'account.receivable.credit'
    ]).then(async accounts=>{
      console.log("accounts", accounts);
      let profileModal = await this.modalCtrl.create({
        component: CashMovePage,
        componentProps: {
          "accountFrom": accounts[0].doc,
          "accountTo": accounts[1].doc,
          "receivable": true,
          "contact": this.contact,
          "select": true,
        }
      });
      profileModal.present();
    })
  }

  createPayableMove(){
    this.pouchdbService.getList([
      'account.payable.credit',
      'account.other.open',
    ]).then(async accounts=>{
      let profileModal = await this.modalCtrl.create({
        component: CashMovePage,
        componentProps: {
          "accountFrom": accounts[0].doc,
          "accountTo": accounts[1].doc,
          "payable": true,
          "contact": this.contact,
          "select": true,
        }
      });
      profileModal.present();
    })
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
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
          console.log("plannedList", plannedList);
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

  async createPayment() {
    let paidPlanneds = [];
    this.plannedList.forEach(item => {
      if (item.amount_paid && item.amount_paid != 0){
        paidPlanneds.push(item.doc);
      }
    })
    let profileModal = await this.modalCtrl.create({
      component: ReceiptPage,
      componentProps: {
        "addPayment": true,
        "select": true,
        "contact": this.contact,
        "account_id": "account.debtColleted",
        "name": "Cobro de Deudas",
        "items": paidPlanneds,
        "signal": this.signal,
      }
    });
    profileModal.present();
  }

  showContact(contact){
    this.navCtrl.navigateForward(['/planned-list', {
      'contact_id': contact._id,
      'signal': this.signal,
    }]);
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
      refresher.target.complete();
    }, 50);
  }


}
