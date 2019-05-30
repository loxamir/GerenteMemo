import { Component, OnInit, Input } from '@angular/core';
import { NavController, ModalController, LoadingController,
   AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { CashService } from './cash.service';
import { CashMovePage } from '../cash-move/cash-move.page';
import { CashMoveService } from '../cash-move/cash-move.service';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { AccountListPage } from '../account-list/account-list.page';
import { FormatService } from "../services/format.service";
import { ConfigService } from '../config/config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountPage } from '../account/account.page';

import { ClosePage } from './close/close.page';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.page.html',
  styleUrls: ['./cash.page.scss'],
})
export class CashPage implements OnInit {
  @Input() select;

    cashForm: FormGroup;
    loading: any;
    languages: Array<LanguageModel>;
    @Input() _id: string;
    changes = {};
    currency_precision = 2;
    user:any = {};
    constructor(
      public navCtrl: NavController,
      public modalCtrl: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      public cashService: CashService,
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
      this.select = this.route.snapshot.paramMap.get('select');
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this.events.unsubscribe('changed-cash-move');
      this.events.subscribe('changed-cash-move', (change)=>{
        if (!this.changes.hasOwnProperty(change.seq)){
if (
            change.doc.accountFrom_id == this._id
            || change.doc.accountTo_id == this._id
          ){
          console.log("changed-cash-move", change);
          this.cashService.handleChange(this.cashForm.value.moves, change);
          this.cashService.localHandleChangeData(
            this.cashForm.value.moves, this.cashForm.value.waiting, change);
          this.cashService.handleSumatoryChange(this.cashForm.value.balance, this.cashForm, change);
          this.events.publish('refresh-cash-list', change);
          this.changes[change.seq] = true;
}
        }
      })
      this.events.subscribe('changed-close', (change)=>{
        console.log("changeddd", change);
        this.events.unsubscribe('changed-close');
        if (change.doc.cash_id == this._id){
          this.cashForm.value.closes.unshift(change.doc);
          this.cashForm.patchValue({
            moves: [],
            closes: this.cashForm.value.closes
          })
        }
        // console.log("close-cash", change);
        // this.cashForm.value.moves.for
        // console.log("change.doc", change.doc);
        // if (change.doc.close_id){
        //   console.log("changed with close_id");
        //   list.splice(changedIndex, 1);
        // }
      })
    }

    async ngOnInit() {
      this.cashForm = this.formBuilder.group({
        name: new FormControl('', Validators.required),
        balance: new FormControl(0),
        currency: new FormControl({}),
        // currency_name: new FormControl(''),
        moves: new FormControl([]),
        closes: new FormControl([]),
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
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      let config:any = (await this.pouchdbService.getDoc('config.profile'));
      this.currency_precision = config.currency_precision;
      this.user = (await this.pouchdbService.getUser());
      if (this._id){
        this.cashService.getCash(this._id).then((data) => {
          // console.log("data", data);
          this.cashForm.patchValue(data);
          this.recomputeValues();
          this.loading.dismiss();
        });
      } else {
        this.loading.dismiss();
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
        let profileModal = await this.modalCtrl.create({
          component: CurrencyListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      });
    }

    closeCash() {
      return new Promise(async resolve => {
        // this.avoidAlertMessage = true;
        // this.events.unsubscribe('select-currency');
        // this.events.subscribe('select-currency', (data) => {
        //   this.cashForm.patchValue({
        //     currency: data,
        //     // currency_name: data.name,
        //   });
        //   this.cashForm.markAsDirty();
        //   // this.avoidAlertMessage = false;
        //   this.events.unsubscribe('select-currency');
        //   resolve(true);
        // })
        console.log("closes", this.cashForm.value.closes);
        let profileModal = await this.modalCtrl.create({
          component: ClosePage,
          componentProps: {
            "select": true,
            "amount_open": this.cashForm.value.closes[0] && this.cashForm.value.closes[0].amount_physical|| 0,
            "amount_theoretical": this.cashForm.value.balance,
            "cash_id": this.cashForm.value._id,
            "accountMoves": this.cashForm.value.moves
          }
        });
        profileModal.present();
      });
    }

    openClose(item) {
      return new Promise(async resolve => {
        let profileModal = await this.modalCtrl.create({
          component: ClosePage,
          componentProps: {
            "select": true,
            "_id": item._id
          }
        });
        profileModal.present();
      });
    }

    async editAccount() {
      // return new Promise(async resolve => {
        // this.avoidAlertMessage = true;
        // this.events.unsubscribe('select-currency');
        // this.events.subscribe('select-currency', (data) => {
        //   this.cashForm.patchValue({
        //     currency: data,
        //     // currency_name: data.name,
        //   });
        //   this.cashForm.markAsDirty();
        //   // this.avoidAlertMessage = false;
        //   this.events.unsubscribe('select-currency');
        //   resolve(true);
        // })
        let profileModal = await this.modalCtrl.create({
          component: AccountPage,
          componentProps: {
            "select": true,
            "_id": this.cashForm.value._id
          }
        });
        profileModal.present();
      // });
    }

    buttonSave() {
      if (this._id){
        this.cashService.updateCash(this.cashForm.value);
        // this.navCtrl.navigateBack().then(() => {
        this.navCtrl.navigateBack('/cash-list');
        // .then(() => {
          this.events.publish('open-cash', this.cashForm.value);
        // });
      } else {
        this.cashService.createCash(this.cashForm.value).then(doc => {
          //console.log("docss", doc);
          this.cashForm.patchValue({
            _id: doc['id'],
          });
          this._id = doc['id'];
          this.navCtrl.navigateBack('/cash-list');
          // .then(() => {
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


    async openItem(item) {
      let profileModal = await this.modalCtrl.create({
        component: CashMovePage,
        componentProps: {
          "select": true,
          "_id": item._id,
        }
      });
      profileModal.present();

      this.events.subscribe('open-cash-move', (data) => {
        //console.log("Payment", data);
        item.amount = data.amount;
        item.date = data.date;
        this.recomputeValues();
        this.events.unsubscribe('open-cash-move');
      });
      //console.log("item", item);
      // this.navCtrl.navigateForward(['/cash-move', {
      //   "_id": item._id,
      // }]);
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
        let profileModal = await this.modalCtrl.create({
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
      let profileModal = await this.modalCtrl.create({
        component: CashMovePage,
        componentProps: {
          "select": true,
          "cash_in": true,
          "accountTo": this.cashForm.value,
        }
      });
      profileModal.present();
    }

    async addTransfer(fab){
      fab.close();
      let profileModal = await this.modalCtrl.create({
        component: CashMovePage,
        componentProps: {
          "select": true,
          "accountFrom": this.cashForm.value,
          "transfer": true,
        }
      });
      profileModal.present();
    }

    async addExpense(fab){
      fab.close();
      let profileModal = await this.modalCtrl.create({
        component: CashMovePage,
        componentProps: {
          "select": true,
          "cash_out": true,
          "accountFrom": this.cashForm.value,
        }
      });
      profileModal.present();
    }

    doRefresh(refresher) {
      setTimeout(() => {
        this.cashService.getCash(this._id).then((data) => {
          this.cashForm.patchValue(data);
          this.recomputeValues();
          //this.loading.dismiss();
        });
        refresher.target.complete();
      }, 500);
    }

    doRefreshList(){
      this.cashService.getCash(this._id).then((data) => {
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


    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
        if(this.cashForm.dirty) {
            let alertPopup = await this.alertCtrl.create({
                header: 'Descartar',
                message: '¿Deseas salir sin guardar?',
                buttons: [{
                        text: 'Si',
                        handler: () => {
                            // alertPopup.dismiss().then(() => {
                                this.exitPage();
                            // });
                        }
                    },
                    {
                        text: 'No',
                        handler: () => {
                            // need to do something if the user stays?
                        }
                    }]
            });

            // Show the alert
            alertPopup.present();

            // Return false to avoid the page to be popped up
            return false;
        } else {
          this.exitPage();
        }
    }

    private exitPage() {
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.cashForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/cash-list');
      }
    }


    deleteCashMove(item){
      this.cashMoveService.deleteCashMove(item);

      // this.cashForm.value.items.slice(item, 1);
      // this.cashForm.value.balance -= item.amount;
    }
}
