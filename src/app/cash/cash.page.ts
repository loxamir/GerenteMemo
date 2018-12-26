import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController,
   AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { CashService } from './cash.service';
import { CashMovePage } from '../cash-move/cash-move.page';
import { CashMoveService } from '../cash-move/cash-move.service';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { AccountListPage } from '../account-list/account-list.page';
import { FormatService } from "../services/format.service";
import { ConfigService } from '../config/config.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.page.html',
  styleUrls: ['./cash.page.scss'],
})
export class CashPage implements OnInit {

    cashForm: FormGroup;
    loading: any;
    languages: Array<LanguageModel>;
    _id: string;

    constructor(
      public navCtrl: NavController,
      public modal: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      // public cashService: CashService,
      public cashMoveService: CashMoveService,
      public route: ActivatedRoute,
      public configService: ConfigService,
      public formBuilder: FormBuilder,
      public alertCtrl: AlertController,
      public pouchdbService: PouchdbService,
      public events: Events,
      public formatService: FormatService,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.languages = this.languageService.getLanguages();
      this._id = this.route.snapshot.paramMap.get('_id');
      this.events.subscribe('changed-cash-move', (change)=>{
        // this.cashService.handleChange(this.cashForm.value.moves, change);
        this.localHandleChangeData(
        this.cashForm.value.moves, this.cashForm.value.waiting, change);
      })
    }

    ngOnInit() {
      this.cashForm = this.formBuilder.group({
        name: new FormControl('', Validators.required),
        balance: new FormControl(0),
        currency: new FormControl({}),
        // currency_name: new FormControl(''),
        moves: new FormControl([]),
        checks: new FormControl([]),
        waiting: new FormControl([]),
        bank_name: new FormControl(''),
        type: new FormControl('cash'),
        section: new FormControl('moves'),
        sequence: new FormControl(1),
        note: new FormControl(''),
        code: new FormControl(''),
        // default: new FormControl(false),
        _id: new FormControl(''),
      });
      //this.loading.present();
      if (this._id){
        this.getCash(this._id).then((data) => {
          this.cashForm.patchValue(data);
          this.recomputeValues();
          //this.loading.dismiss();
        });
      } else {
        //this.loading.dismiss();
      }
    }

    selectCurrency() {
      return new Promise(async resolve => {
        // this.avoidAlertMessage = true;
        this.events.unsubscribe('select-currency');
        this.events.subscribe('select-currency', (data) => {
          this.cashForm.patchValue({
            currency: data,
            // currency_name: data.name,
          });
          this.cashForm.markAsDirty();
          // this.avoidAlertMessage = false;
          this.events.unsubscribe('select-currency');
          resolve(true);
        })
        let profileModal = await this.modal.create({
          component: CurrencyListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      });
    }

    buttonSave() {
      if (this._id){
        this.updateCash(this.cashForm.value);
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('open-cash', this.cashForm.value);
        // });
      } else {
        this.createCash(this.cashForm.value).then(doc => {
          //console.log("docss", doc);
          this.cashForm.patchValue({
            _id: doc['id'],
          });
          this._id = doc['id'];
          // this.navCtrl.navigateBack().then(() => {
            this.events.publish('create-cash', this.cashForm.value);
          // });
        });
      }
    }

    setLanguage(lang: LanguageModel){
      let language_to_set = this.translate.getDefaultLang();
      if(lang){
        language_to_set = lang.code;
      }
      this.translate.setDefaultLang(language_to_set);
      this.translate.use(language_to_set);
    }


    openItem(item) {
      this.events.subscribe('open-cash-move', (data) => {
        //console.log("Payment", data);
        item.amount = data.amount;
        item.date = data.date;
        this.recomputeValues();
        this.events.unsubscribe('open-cash-move');
      });
      //console.log("item", item);
      this.navCtrl.navigateForward(['/cash-move', {
        "_id": item._id,
      }]);
    }

    recomputeValues() {

    }

    validation_messages = {
      'name': [
        { type: 'required', message: 'Name is required.' }
      ]
    };

    selectAccount() {
      return new Promise(async resolve => {
        this.events.subscribe('select-account', (data) => {
          this.events.unsubscribe('select-account');
          resolve(data);
        })
        let profileModal = await this.modal.create({
          component: AccountListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      });
    }

    async addIncome(fab){
      fab.close();
      let profileModal = await this.modal.create({
        component: CashMovePage,
        componentProps: {
          "accountTo": this.cashForm.value,
        }
      });
      profileModal.present();
    }

    async addTransfer(fab){
      fab.close();
      let profileModal = await this.modal.create({
        component: CashMovePage,
        componentProps: {
          "accountFrom": this.cashForm.value,
          "transfer": true,
        }
      });
      profileModal.present();
    }

    async addExpense(fab){
      fab.close();
      let profileModal = await this.modal.create({
        component: CashMovePage,
        componentProps: {
          "accountFrom": this.cashForm.value,
        }
      });
      profileModal.present();
    }

    doRefresh(refresher) {
      setTimeout(() => {
        this.getCash(this._id).then((data) => {
          this.cashForm.patchValue(data);
          this.recomputeValues();
          //this.loading.dismiss();
        });
        refresher.target.complete();
      }, 500);
    }

    doRefreshList(){
      this.getCash(this._id).then((data) => {
        this.cashForm.patchValue(data);
        this.recomputeValues();
        //this.loading.dismiss();
      });
    }

    onSubmit(values){
      //console.log(values);
    }

    async changeName(){
      let prompt = await this.alertCtrl.create({
        header: 'Nombre del Caja',
        message: 'Cual es el nombre de este caja?',
        inputs: [
          {
            name: 'name',
            placeholder: 'Caja Chica',
            value: this.cashForm.value.name
        },

        ],
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Confirmar',
            handler: data => {
              //console.log("sale", data);
              this.cashForm.value.name = data.name;
            }
          }
        ]
      });

      prompt.present();
    }



      getCash(doc_id): Promise<any> {
        return new Promise((resolve, reject)=>{
          ////console.log("getPlanned");
          let payableList = [];
          this.pouchdbService.getView(
            'stock/Caixas', 2,
            [doc_id, '0'],
            [doc_id, 'z']
          ).then((planneds: any[]) => {
            // console.log("Caixas", planneds);
            let promise_ids = [];
            let pts = [];
            let balance = 0;
            planneds.forEach(item => {
              // if (item.value != 0){
                pts.push(item);
                // console.log("ites", item);
                promise_ids.push(this.cashMoveService.getCashMove(item.key[1]));
                balance += parseFloat(item.value);
              // }
            })
            promise_ids.push(this.pouchdbService.getDoc(doc_id));
            Promise.all(promise_ids).then(cashMoves => {
              // resolve(pts);
              // console.log("cashMoves", cashMoves);
              // let cash = ;
              let cash = Object.assign({}, cashMoves[cashMoves.length-1]);
              cash.moves = [];
              cash.balance = balance;
              cash.account = cashMoves[cashMoves.length-1];
              // cash.name
              cash.waiting = [];
              for(let i=0;i<pts.length;i++){
                if (cashMoves[i].state == 'WAITING'){
                  cash.waiting.unshift(cashMoves[i]);
                } else {
                  cash.moves.unshift(cashMoves[i]);
                }
                // console.log(cashMoves[i].value);
              }
              // console.log("PTS2", cash);
              // let receivables = pts.filter(word => word['contact_name'] && word['contact_name'].toString().search(new RegExp(keyword, "i")) != -1);
              resolve(cash);
            })
          });
        });
      }

      createCash(cash){
        cash.docType = 'account';
        delete cash.moves;
        delete cash.cash;
        return new Promise((resolve, reject)=>{
          // if (cash.code && cash.code != ''){
          //   this.pouchdbService.createDoc(cash).then(doc => {
          //     if (cash.type == 'cash'){
          //       cash._id = "account.cash."+cash.code;
          //     }
          //     else if (cash.type == 'bank'){
          //       cash._id = "account.bank."+cash.code;
          //     }
          //     else if (cash.type == 'check'){
          //       cash._id = "account.check."+cash.code;
          //     }
          //     resolve({doc: doc, cash: cash});
          //   });
          // } else {
            // this.configService.getSequence('account').then((code) => {
              let code = this.pouchdbService.getUUID();
              cash['code'] = code;
              if (cash.type == 'cash'){
                cash._id = "account.cash."+cash.code;
              }
              else if (cash.type == 'bank'){
                cash._id = "account.bank."+cash.code;
              }
              else if (cash.type == 'check'){
                cash._id = "account.check."+cash.code;
              }
              this.pouchdbService.createDoc(cash).then(doc => {
                resolve({doc: doc, cash: cash});
              });
            // });
          // }

        });
      }

      getDefaultCash(){
        return new Promise((resolve, reject)=>{
          this.configService.getConfigDoc().then(config => {
            this.pouchdbService.getDoc(config.cash_id).then(default_cash => {
              resolve(default_cash);
            })
          });
        });
      }

      updateCash(cash){
        cash.docType = 'account';
        delete cash.moves;
        delete cash.cash;
        if (cash.currency){
          cash.currency_id = cash.currency._id;
        }
        delete cash.currency;
        return this.pouchdbService.updateDoc(cash);
      }

      deleteCash(cash){
        return this.pouchdbService.deleteDoc(cash);
      }

      handleChange(list, change){
        this.pouchdbService.localHandleChangeData(list, change)
      }

      localHandleChangeData(moves, waiting, change){
        let changedDoc = null;
        let changedState = false;
        let changedIndex = null;
          let list = waiting;
          list.forEach((doc, index) => {
            if(doc._id === change.id){
              changedDoc = doc;
              changedIndex = index;
              if (doc.state == 'WAITING' && change.doc.state == 'DONE'){
                changedState = true;
              }
            }
          });

          //A document was deleted
          if(change.deleted){
            list.splice(changedIndex, 1);
          } else if(changedState){
            list.splice(changedIndex, 1);
            changedState = false;
          }
          else {
            //A document was updated
            if(changedDoc){
              list[changedIndex] = change.doc;
            }
            //A document was added
            else {
              list.unshift(change.doc);
            }
          }
          changedDoc = null;
          changedState = false;
          changedIndex = null;
          list = moves;
          list.forEach((doc, index) => {
            if(doc._id === change.id){
              changedDoc = doc;
              changedIndex = index;
              if (doc.state == 'DONE' && change.doc.state == 'WAITING'){
                changedState = true;
              }
            }
          });

          //A document was deleted
          if(change.deleted){
            list.splice(changedIndex, 1);
          } else if(changedState){
            list.splice(changedIndex, 1);
            changedState = false;
          }
          else {
            //A document was updated
            if(changedDoc){
              list[changedIndex] = change.doc;
            }
            //A document was added
            else {
              list.unshift(change.doc);
            }
          }
      }




}
