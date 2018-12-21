import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../../services/language/language.service";
import { LanguageModel } from "../../../services/language/language.model";
import { ImagePicker } from '@ionic-native/image-picker';
import { Crop } from '@ionic-native/crop';
import { AccountService } from './account.service';
import { AccountCategorysPage } from './accountCategory/list/accountCategorys';

@Component({
  selector: 'account-page',
  templateUrl: 'account.html'
})
export class AccountPage {
  accountForm: FormGroup;
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
    public accountService: AccountService,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
  }

  ionViewWillLoad() {
    this.accountForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      category: new FormControl({}),
      category_id: new FormControl(''),
      note: new FormControl(''),
      code: new FormControl(''),
      type: new FormControl(''),
      cash_out: new FormControl(false),
      cash_in: new FormControl(false),
      transfer: new FormControl(false),
      payable: new FormControl(false),
      receivable: new FormControl(false),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    if (this._id){
      this.accountService.getAccount(this._id).then((data) => {
        //let currentLang = this.translate.currentLang;
        this.accountForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.accountService.updateAccount(this.accountForm.value);
      this.navCtrl.pop().then(() => {
        this.events.publish('open-account', this.accountForm.value);
      });
    } else {
      this.accountService.createAccount(this.accountForm.value);
      this.navCtrl.pop().then(() => {
        this.events.publish('create-account', this.accountForm.value);
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
    //console.log(values);
  }

  selectCategory() {
    console.log("selectContact");
    return new Promise(resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-accountCategory');
      this.events.subscribe('select-accountCategory', (data) => {
        this.accountForm.patchValue({
          category: data,
          type: data.type,
        });
        this.accountForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-accountCategory');
        resolve(true);
      })
      let profileModal = this.modal.create(AccountCategorysPage, {"select": true, "filter": "customer"});
      profileModal.present();
    });
  }
}
