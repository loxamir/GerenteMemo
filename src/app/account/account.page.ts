import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { AccountService } from './account.service';
import { AccountCategoryListPage } from '../account-category-list/account-category-list.page';
import { AccountCategoryPage } from '../account-category/account-category.page';
import { ConfigService } from '../config/config.service';
import { CurrencyListPage } from '../currency-list/currency-list.page';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  @ViewChild('name', { static: true }) name;
  @ViewChild('type', { static: false }) type;
  @ViewChild('bank_name', { static: false }) bank_name;
  @ViewChild('code', { static: true }) code;

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
    public configService: ConfigService,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    
    
    
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ngOnInit() {
  let language = navigator.language.split('-')[0];
  this.translate.setDefaultLang(language);
  this.translate.use(language);
    this.accountForm = this.formBuilder.group({
      name: new FormControl(null, Validators.required),
      category: new FormControl({}),
      currency: new FormControl({}),
      bank_name: new FormControl(null),
      note: new FormControl(''),
      code: new FormControl(null),
      type: new FormControl(null),
      cash_out: new FormControl(false),
      cash_in: new FormControl(false),
      transfer: new FormControl(false),
      payable: new FormControl(false),
      receivable: new FormControl(false),
      printedText: new FormControl(''),
      filename: new FormControl('filename.prt'),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
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

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
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

  goNextStep() {
      if (!this.accountForm.value.name){
        this.name.setFocus();
      }
      else if (
        Object.keys(this.accountForm.value.category).length==0
      ){
        this.selectCategory();
      }
      else if (!this.accountForm.value.code){
        this.code.setFocus();
      }
      else if (!this.accountForm.value.type){
        this.type.open();
      }
      else if (
        this.accountForm.value.bank_name==null
        && this.accountForm.value.type=='bank'
      ){
        this.bank_name.open();
      }
      // else if (this.accountForm.dirty) {
      //   this.buttonSave();
      // }
  }

  selectCurrency() {
    return new Promise(async resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-currency');
      this.events.subscribe('select-currency', (data) => {
        this.accountForm.patchValue({
          currency: data,
          // currency_name: data.name,
        });
        this.accountForm.markAsDirty();
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
    // console.log("selectContact");
    let self=this;
    return new Promise(async resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-accountCategory');
      this.events.subscribe('select-accountCategory', (data) => {
        let type = data.type;
        if (type == 'liquidity'){
          type='cash';
        }
        this.accountForm.patchValue({
          category: data,
          cash_out: data.cash_out,
          cash_in: data.cash_in,
          transfer: data.transfer,
          payable: data.payable,
          receivable: data.receivable,
          type: type,
          code: data.code+"."
        });
        this.accountForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-accountCategory');
        setTimeout(() => {
          self.code.setFocus();
        }, 200);
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

  editCategory() {
    return new Promise(async resolve => {
      this.events.unsubscribe('open-accountCategory');
      this.events.subscribe('open-accountCategory', (data) => {
        this.accountForm.patchValue({
          category: data,
          type: data.type,
          cash_out: data.cash_out,
          cash_in: data.cash_in,
          transfer: data.transfer,
          payable: data.payable,
          receivable: data.receivable,
        });
        this.accountForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('open-accountCategory');
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: AccountCategoryPage,
        componentProps: {
          "select": true,
          "_id": this.accountForm.value.category._id,
        }
      });
      profileModal.present();
    });
  }

  // getAccount2(doc_id): Promise<any> {
  //   return new Promise(async (resolve, reject)=>{
  //     let account:any = await this.pouchdbService.getDoc(doc_id);//.then((account: any)=>{
  //     let category = this.pouchdbService.getList([account.category_id, account.currency_id,]);//.then(category=>{
  //     account.category = category || {};
  //     let currency = this.pouchdbService.getList([account.category_id, account.currency_id,]);//.then(category=>{
  //     account.currency = currency || {};
  //     resolve(account);
  //   });
  // }

  getAccount(doc_id): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let pouchData = await this.pouchdbService.getDoc(doc_id);
      let docList: any = await this.pouchdbService.getList([
        pouchData['category_id'],
        pouchData['currency_id'],
      ]);
      let docDict = {}
      docList.forEach(item=>{
        docDict[item.id] = item.doc;
      })
      // pouchData['bank'] = docDict[pouchData['bank_id']];
      pouchData['category'] = docDict[pouchData['category_id']];
      pouchData['currency'] = docDict[pouchData['currency_id']];
      resolve(pouchData);
    });
  }

  async createAccount(viewData){
    //console.log("try create", account);
    let account = Object.assign({}, viewData);
    account.docType = 'account';
    // account['code'] = account['code'] || this.pouchdbService.getUUID();
     // = code;

    if (account.type == 'cash'){
      // account['code'] == account['code'] || ;
      account._id = "account.cash."+await this.configService.getSequence('cash');
    }
    else if (account.type == 'bank'){
      // account['code'] == account['code'] || await this.configService.getSequence('cash');
      account._id = "account.bank."+await this.configService.getSequence('cash');
    }
    else if (account.type == 'check'){
      // account['code'] == account['code'] || await this.configService.getSequence('cash');
      account._id = "account.check."+await this.configService.getSequence('cash');
    }
    account.category_id = account.category && account.category._id || account.category_id;
    delete account.category;
    account.currency_id = account.currency && account.currency._id || account.currency_id;
    delete account.currency;
    return this.pouchdbService.createDoc(account);
  }

  updateAccount(viewData){
    let account = Object.assign({}, viewData);
    account.docType = 'account';
    account.category_id = account.category && account.category._id || account.category_id;
    delete account.category;
    account.currency_id = account.currency && account.currency._id || account.currency_id;
    delete account.currency;
    return this.pouchdbService.updateDoc(account);
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.accountForm.dirty) {
          let alertPopup = await this.alertCtrl.create({
              header: this.translate.instant('DISCARD'),
              message: this.translate.instant('SURE_DONT_SAVE'),
              buttons: [{
                      text: this.translate.instant('YES'),
                      handler: () => {
                          // alertPopup.dismiss().then(() => {
                              this.exitPage();
                          // });
                      }
                  },
                  {
                      text: this.translate.instant('NO'),
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
  showNextButton(){
    // console.log("stock",this.accountForm.value.stock);
    if (!this.accountForm.value.name){
      return true;
    }
    else if (
      !Object.keys(this.accountForm.value.category).length
    ){
      return true;
    }
    else if (!this.accountForm.value.code){
      return true;
    }
    else if (!this.accountForm.value.type){
      return true;
    }
    else if (
      this.accountForm.value.bank_name==null
      && this.accountForm.value.type=='bank'
    ){
      return true;
    }
    else {
      return false;
    }
  }

  showSaveButton(){
    // console.log("stock",this.accountForm.value.stock);
    if (this.accountForm.dirty){
      if (!this.accountForm.value.name){
        return false;
      }
      else if (!Object.keys(this.accountForm.value.category).length){
        return false;
      }
      else if (!this.accountForm.value.code){
        return false;
      }
      else if (!this.accountForm.value.type){
        return false;
      }
      else if (this.accountForm.value.bank_name==null
        &&this.accountForm.value.type=='bank'){
        return false;
      }
      else {
        return true;
      }
    } else {
      return false;
    }
  }

}
