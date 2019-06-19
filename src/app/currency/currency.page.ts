import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events, AlertController } from '@ionic/angular';
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
    select;

    constructor(
      public navCtrl: NavController,
      public modal: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public alertCtrl: AlertController,
      public pouchdbService: PouchdbService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      // public currencyService: CurrencyService,
      public modalCtrl: ModalController,
      public route: ActivatedRoute,

      public formBuilder: FormBuilder,
      public events: Events,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
    }

    ngOnInit() {
      this.currencyForm = this.formBuilder.group({
        name: new FormControl('', Validators.required),
        precision: new FormControl(2),
        inverted_rate: new FormControl(false),
        inverted_sale_rate: new FormControl(1),
        inverted_purchase_rate: new FormControl(1),
        sale_rate: new FormControl(1),
        symbol: new FormControl('X$'),
        purchase_rate: new FormControl(1),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
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

    async buttonSave() {
      if (this._id){
        await this.updateCurrency(this.currencyForm.value);
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('open-currency', this.currencyForm.value);
          this.exitPage();
        // });
      } else {
        await this.createCurrency(this.currencyForm.value);
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-currency', this.currencyForm.value);
          this.exitPage();
        // });
      }
    }

    changedPurchageRate() {
      this.currencyForm.patchValue({
        purchase_rate: 1/this.currencyForm.value.inverted_purchase_rate,
      })
    }

    changedSaleRate() {
      this.currencyForm.patchValue({
        sale_rate: 1/this.currencyForm.value.inverted_sale_rate,
      })
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

    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
        if(this.currencyForm.dirty) {
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
        // this.currencyForm.markAsPristine();
        this.navCtrl.navigateBack('/currency-list');
      }
    }

}
