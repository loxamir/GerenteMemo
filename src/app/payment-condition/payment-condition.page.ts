import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { PaymentConditionService } from './payment-condition.service';

import { AccountListPage } from '../account-list/account-list.page';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-payment-condition',
  templateUrl: './payment-condition.page.html',
  styleUrls: ['./payment-condition.page.scss'],
})
export class PaymentConditionPage implements OnInit {
    @ViewChild('nameField') nameField;
    paymentConditionForm: FormGroup;
    loading: any;
    languages: Array<LanguageModel>;
    _id: string;
    select;

    constructor(
      public navCtrl: NavController,
      public modalCtrl: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public pouchdbService: PouchdbService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      // public paymentConditionService: PaymentConditionService,
      public route: ActivatedRoute,

      public formBuilder: FormBuilder,
      public events: Events,
      public alertCtrl: AlertController,
    ) {
      this.languages = this.languageService.getLanguages();
      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
    }

    async ngOnInit() {
      setTimeout(() => {
        this.nameField.setFocus();
      }, 500);
      this.paymentConditionForm = this.formBuilder.group({
        name: new FormControl(),
        accountTo: new FormControl({}),
        accountTo_id: new FormControl(''),
        accountFrom: new FormControl({}),
        accountFrom_id: new FormControl(''),
        items: new FormControl([]),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
      });
      //this.loading.present();
      if (this._id){
        this.getPaymentCondition(this._id).then((data) => {
          this.paymentConditionForm.patchValue(data);
          //this.loading.dismiss();
        });
      } else {
        let accountTo:any = (await this.pouchdbService.getDoc("account.receivable.credit") || {});
        let accountFrom: any = (await this.pouchdbService.getDoc("account.payable.credit")) || {};
        this.paymentConditionForm.patchValue({
          accountTo: accountTo,
          accountTo_id: accountTo._id,
          accountFrom: accountFrom,
          accountFrom_id: accountFrom._id,
        })
        // console.log("accountTo", accountTo);
        //this.loading.dismiss();
      }
    }

    selectAccountTo() {
      // console.log("selectAccount");
      // if (this.paymentConditionForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
          // this.avoidAlertMessage = true;
          this.events.unsubscribe('select-account');
          this.events.subscribe('select-account', (data) => {
            this.paymentConditionForm.patchValue({
              accountTo: data,
              // account_name: data.name,
              accountTo_id: data._id,
            });
            this.paymentConditionForm.markAsDirty();
            // this.avoidAlertMessage = false;
            this.events.unsubscribe('select-account');
            resolve(true);
          })
          let profileModal = await this.modalCtrl.create({
            component: AccountListPage,
            componentProps: {
              "select": true
            }
          });
          profileModal.present();
        });
      // }
    }

    selectAccountFrom() {
      // console.log("selectAccount");
      // if (this.paymentConditionForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
          // this.avoidAlertMessage = true;
          this.events.unsubscribe('select-account');
          this.events.subscribe('select-account', (data) => {
            this.paymentConditionForm.patchValue({
              accountFrom: data,
              accountFrom_id: data._id,
            });
            this.paymentConditionForm.markAsDirty();
            // this.avoidAlertMessage = false;
            this.events.unsubscribe('select-account');
            resolve(true);
          })
          let profileModal = await this.modalCtrl.create({
            component: AccountListPage,
            componentProps: {
              "select": true
            }
          });
          profileModal.present();
        });
      // }
    }



    async addItem(){
      let prompt = await this.alertCtrl.create({
        header: 'Cuota',
        message: 'Cantidad de dias y porcentaje de la cuota?',
        inputs: [
          {
            type: 'number',
            name: 'days',
            placeholder: 'Dias'
          },{
            placeholder: 'Porcentage',
            type: 'number',
            name: 'percent'
          },
        ],
        buttons: [
          {
            text: 'Cancelar'
          },
          {
            text: 'Confirmar',
            handler: data => {
              this.paymentConditionForm.value.items.push({
                'days': data.days,
                'percent': data.percent,
              })
            }
          }
        ]
      });

      prompt.present();

    }

    deleteItem(item){
      let index = this.paymentConditionForm.value.items.indexOf(item)
      this.paymentConditionForm.value.items.splice(index, 1);
    }

    async editItem(item){
      let prompt = await this.alertCtrl.create({
        header: 'Condicion de Pago',
        message: 'Cantidad de dias y porcentaje de la cuota?',
        inputs: [
          {
            type: 'number',
            name: 'days',
            placeholder: 'Dias',
            value: item.days
          },{
            placeholder: 'Porcentage',
            type: 'number',
            name: 'percent',
            value: item.percent
          },
        ],
        buttons: [
          {
            text: 'Cancelar'
          },
          {
            text: 'Confirmar',
            handler: data => {
              item.days = data.days;
              item.percent = data.percent;
            }
          }
        ]
      });

      prompt.present();
    }

    buttonSave() {
      if (this._id){
        this.updatePaymentCondition(this.paymentConditionForm.value);
        if (this.select){
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('payment-condition-list');
          // .then(() => {
            this.events.publish('open-payment-condition', this.paymentConditionForm.value);
          // });
        }
      } else {
        this.createPaymentCondition(this.paymentConditionForm.value).then((doc: any) => {
          //console.log("docss", doc);
          this.paymentConditionForm.patchValue({
            _id: doc.id,
          });
          this._id = doc.id;
          if (this.select){
            this.modalCtrl.dismiss();
          } else {
            this.navCtrl.navigateBack('payment-condition-list');
            // .then(() => {
              this.events.publish('create-payment-condition', this.paymentConditionForm.value);
            // });
          }
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

    validation_messages = {
      'name': [
        { type: 'required', message: 'Name is required.' }
      ]
    };

    onSubmit(values){
      //console.log("teste", values);
    }

    getPaymentCondition(doc_id): Promise<any> {
      return new Promise((resolve, reject)=>{
        this.pouchdbService.getDoc(doc_id).then((paymentCondition: any)=>{
          this.pouchdbService.getList([
            paymentCondition.accountFrom_id,
            paymentCondition.accountTo_id,
          ]).then((accounts: any[])=>{
            paymentCondition.accountFrom = accounts[0].doc;
            paymentCondition.accountTo = accounts[1].doc;
            resolve(paymentCondition);
          })
        })
      })
    }

    createPaymentCondition(paymentCondition){
      paymentCondition.docType = 'payment-condition';
      return this.pouchdbService.createDoc(paymentCondition);
    }

    updatePaymentCondition(paymentCondition){
      paymentCondition.docType = 'payment-condition';
      return this.pouchdbService.updateDoc(paymentCondition);
    }

    getPaymentConditionList(keyword){
      return this.pouchdbService.searchDocTypeData('payment-condition');
    }

    deletePaymentCondition(paymentCondition) {
      return this.pouchdbService.deleteDoc(paymentCondition);
    }

    goNextStep() {
      if (this.paymentConditionForm.value.name==null || this.paymentConditionForm.value.name==''){
        this.nameField.setFocus();
      } else if (!this.paymentConditionForm.value.items.length){
        this.addItem();
      }
    }

    showNextButton(){
      // console.log("stock",this.paymentConditionForm.value.stock);
      if (this.paymentConditionForm.value.name==null || this.paymentConditionForm.value.name==''){
        return true;
      }
      else if (!this.paymentConditionForm.value.items.length){
        return true;
      }
      else {
        return false;
      }
    }

    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
        if(this.paymentConditionForm.dirty) {
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
        // this.paymentConditionForm.markAsPristine();
        this.navCtrl.navigateBack('/payment-condition-list');
      }
    }

}
