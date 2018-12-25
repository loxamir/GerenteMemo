import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { CurrencyService } from './currency.service';

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

    constructor(
      public navCtrl: NavController,
      public modal: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public pouchdbService: PouchdbService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      // public currencyService: CurrencyService,
      public route: ActivatedRoute,

      public formBuilder: FormBuilder,
      public events: Events,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.languages = this.languageService.getLanguages();
      this._id = this.route.snapshot.paramMap.get('_id');
    }

    ngOnInit() {
      this.currencyForm = this.formBuilder.group({
        name: new FormControl('', Validators.required),
        sale_rate: new FormControl(1),
        purchase_rate: new FormControl(1),
        _id: new FormControl(''),
      });
      //this.loading.present();
      if (this._id){
        this.getCurrency(this._id).then((data) => {
          this.currencyForm.patchValue(data);
          //this.loading.dismiss();
        });
      } else {
        //this.loading.dismiss();
      }
    }

    buttonSave() {
      if (this._id){
        this.updateCurrency(this.currencyForm.value);
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('open-currency', this.currencyForm.value);
        // });
      } else {
        this.createCurrency(this.currencyForm.value);
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-currency', this.currencyForm.value);
        // });
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

    getCurrency(doc_id): Promise<any> {
      return this.pouchdbService.getDoc(doc_id);
    }

    createCurrency(currency){
      currency.docType = 'currency';
      return this.pouchdbService.createDoc(currency);
    }

    updateCurrency(currency){
      currency.docType = 'currency';
      return this.pouchdbService.updateDoc(currency);
    }

    getCurrencyList(keyword){
      return this.pouchdbService.searchDocTypeData('currency');
    }

}
