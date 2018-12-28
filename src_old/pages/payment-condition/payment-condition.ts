import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { PaymentConditionService } from './payment-condition.service';

import { AccountsPage } from '../cash/move/account/list/accounts';

@Component({
  selector: 'payment-condition-page',
  templateUrl: 'payment-condition.html'
})
export class PaymentConditionPage {

  paymentConditionForm: FormGroup;
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
    public paymentConditionService: PaymentConditionService,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
    public events: Events,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get(_id);
  }

  ionViewWillLoad() {
    this.paymentConditionForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      sale_rate: new FormControl(1),
      purchase_rate: new FormControl(1),
      accountTo: new FormControl({}),
      accountTo_id: new FormControl(''),
      accountFrom: new FormControl({}),
      accountFrom_id: new FormControl(''),
      items: new FormControl([]),
      _id: new FormControl(''),
    });
  }

  selectAccountTo() {
    console.log("selectAccount");
    // if (this.paymentConditionForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
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
        let profileModal = this.modal.create(AccountsPage, {"select": true});
        profileModal.present();
      });
    // }
  }

  selectAccountFrom() {
    console.log("selectAccount");
    // if (this.paymentConditionForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
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
        let profileModal = this.modal.create(AccountsPage, {"select": true});
        profileModal.present();
      });
    // }
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.paymentConditionService.getPaymentCondition(this._id).then((data) => {
        this.paymentConditionForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  addItem(){
    this.paymentConditionForm.value.items.push({
      'days': 5,
      'percent': 10,
    })
  }

  deleteItem(item){
    let index = this.paymentConditionForm.value.items.indexOf(item)
    this.paymentConditionForm.value.items.splice(index, 1);
  }

  editItem(item){
    let prompt = this.alertCtrl.create({
      title: 'Precio del Producto',
      message: 'Cual es el precio de este producto?',
      inputs: [
        {
          type: 'number',
          name: 'days',
          value: item.days
        },{
          type: 'number',
          name: 'percent',
          value: item.percent
        },
      ],
      buttons: [
        {
          text: 'Cancel'
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
      this.paymentConditionService.updatePaymentCondition(this.paymentConditionForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-payment-condition', this.paymentConditionForm.value);
      });
    } else {
      this.paymentConditionService.createPaymentCondition(this.paymentConditionForm.value).then((doc: any) => {
        //console.log("docss", doc);
        this.paymentConditionForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-payment-condition', this.paymentConditionForm.value);
        });
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
}
