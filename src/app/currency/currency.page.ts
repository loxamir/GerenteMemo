import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, Events, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'app-currency',
  templateUrl: './currency.page.html',
  styleUrls: ['./currency.page.scss'],
})
export class CurrencyPage implements OnInit {
  currencyForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  select;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    this._id = this.route.snapshot.paramMap.get('_id');
  }

  async ngOnInit() {
    this.currencyForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      precision: new FormControl(2),
      inverted_rate: new FormControl(false),
      exchange_rate: new FormControl(1),
      symbol: new FormControl('X$'),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    //this.loading.present();
    if (this._id) {
      this.getCurrency(this._id).then((data) => {
        this.currencyForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  async buttonSave() {
    if (this._id) {
      await this.updateCurrency(this.currencyForm.value);
      this.events.publish('open-currency', this.currencyForm.value);
      this.exitPage();
    } else {
      await this.createCurrency(this.currencyForm.value);
      this.events.publish('create-currency', this.currencyForm.value);
      this.exitPage();
    }
  }

  setLanguage(lang: LanguageModel) {
    let language_to_set = this.translate.getDefaultLang();

    if (lang) {
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

  onSubmit(values) {
    //console.log("teste", values);
  }

  getCurrency(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createCurrency(currency) {
    currency.docType = 'currency';
    return this.pouchdbService.createDoc(currency);
  }

  updateCurrency(currency) {
    currency.docType = 'currency';
    return this.pouchdbService.updateDoc(currency);
  }

  getCurrencyList(keyword) {
    return this.pouchdbService.searchDocTypeData('currency');
  }

  discard() {
    this.canDeactivate();
  }
  async canDeactivate() {
    if (this.currencyForm.dirty) {
      let alertPopup = await this.alertCtrl.create({
        header: this.translate.instant('DISCARD'),
        message: this.translate.instant('SURE_DONT_SAVE'),
        buttons: [{
          text: this.translate.instant('YES'),
          handler: () => {
            this.exitPage();
          }
        },
        {
          text: this.translate.instant('NO'),
          handler: () => {
          }
        }]
      });
      alertPopup.present();
      return false;
    } else {
      this.exitPage();
    }
  }

  private exitPage() {
    if (this.select) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.navigateBack('/currency-list');
    }
  }

}
