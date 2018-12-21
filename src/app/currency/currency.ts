import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, ViewController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ImagePicker } from '@ionic-native/image-picker';
import { Crop } from '@ionic-native/crop';
import { CurrencyService } from './currency.service';

@Component({
  selector: 'currency-page',
  templateUrl: 'currency.html'
})
export class CurrencyPage {

  currencyForm: FormGroup;
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
    public currencyService: CurrencyService,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
  }

  ionViewWillLoad() {
    this.currencyForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      sale_rate: new FormControl(1),
      purchase_rate: new FormControl(1),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    if (this._id){
      this.currencyService.getCurrency(this._id).then((data) => {
        this.currencyForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.currencyService.updateCurrency(this.currencyForm.value);
      this.navCtrl.pop().then(() => {
        this.events.publish('open-currency', this.currencyForm.value);
      });
    } else {
      this.currencyService.createCurrency(this.currencyForm.value);
      this.navCtrl.pop().then(() => {
        this.events.publish('create-currency', this.currencyForm.value);
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
