import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { AccountService } from './account.service';
import { AccountCategoryListPage } from '../account-category-list/account-category-list.page';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  accountForm: FormGroup;
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
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ngOnInit() {
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
    //this.loading.present();
    if (this._id){
      this.getAccount(this._id).then((data) => {
        //let currentLang = this.translate.currentLang;
        this.accountForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.updateAccount(this.accountForm.value);
      this.events.publish('open-account', this.accountForm.value);
    } else {
      this.createAccount(this.accountForm.value);
      this.events.publish('create-account', this.accountForm.value);
      // this.navCtrl.navigateBack('/account-list');
    }
    if (this.select){
      this.modalCtrl.dismiss();
    }
    else {
      this.navCtrl.navigateBack('/account-list');
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
    return new Promise(async resolve => {
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
      let profileModal = await this.modalCtrl.create({
        component: AccountCategoryListPage,
        componentProps: {
          "select": true,
          "filter": "customer"
        }
      });
      profileModal.present();
    });
  }

  getAccount(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then((account: any)=>{
        this.pouchdbService.getDoc(account.category_id).then(category=>{
          account.category = category || {};
          resolve(account);
        });
      });
    });
  }

  createAccount(viewData){
    //console.log("try create", account);
    let account = Object.assign({}, viewData);
    account.docType = 'account';
    account['code'] = account['code'] || this.pouchdbService.getUUID();
     // = code;
    if (account.type == 'cash'){
      account._id = "account.cash."+account.code;
    }
    else if (account.type == 'bank'){
      account._id = "account.bank."+account.code;
    }
    else if (account.type == 'check'){
      account._id = "account.check."+account.code;
    }
    account.category_id = account.category && account.category._id || account.category_id;
    delete account.category;
    return this.pouchdbService.createDoc(account);
  }

  updateAccount(viewData){
    let account = Object.assign({}, viewData);
    account.docType = 'account';
    account.category_id = account.category && account.category._id || account.category_id;
    delete account.category;
    return this.pouchdbService.updateDoc(account);
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.accountForm.dirty) {
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
      this.accountForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/sale-list');
    }
  }

}
