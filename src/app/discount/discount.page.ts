import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { NavController, ModalController, LoadingController, AlertController, Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
// import { DiscountService } from '../services/discount.page.service';
// import { RestProvider } from "../services/rest/rest";
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from "../services/rest/rest";
import { UserPage } from '../user/user.page';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.page.html',
  styleUrls: ['./discount.page.scss'],
})
export class DiscountPage implements OnInit {
@ViewChild('discount_percent') discount_percent;
@ViewChild('discount_amount') discount_amount;
@ViewChild('new_amount') new_amount;

  discountForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  opened: boolean = false;
  select;
  customer;
  supplier;
  seller;
  amount_original;
  currency_precision = 2;
  changing=false;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public alertCtrl: AlertController,
    // public discountService: DiscountService,
    // public restProvider: RestProvider,
    // public navParams: NavParams,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
    public restProvider: RestProvider,
  ) {
    // this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    // this._id = this.route.snapshot.paramMap.get('_id');
    // this.route.params.subscribe(...);
    // console.log("paramap", this.route.snapshot.paramMap.get('_id'), this._id);
    this.select = this.route.snapshot.paramMap.get('select');

    this.customer = this.route.snapshot.paramMap.get('customer');
    this.supplier = this.route.snapshot.paramMap.get('supplier');
    this.seller = this.route.snapshot.paramMap.get('seller');
    this.amount_original = this.route.snapshot.paramMap.get('amount_original');
    this.currency_precision = parseInt(this.route.snapshot.paramMap.get('currency_precision'));
    // if (this.navParams.data._id){
    //   this.opened = true;
    // }
    // this.route.params.subscribe(...);
  }
  // goBack(){
  //   this.navCtrl.navigateBack('/discount-list');
  // }
  async ngOnInit() {
    this.discountForm = this.formBuilder.group({
      discount_percent: new FormControl(0),
      discount_amount: new FormControl(0),
      new_amount: new FormControl(this.amount_original||0),
      seller: new FormControl(this.seller||false),
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    console.log("paramap", this.route.snapshot.paramMap.get('_id'), this._id, this.select);
    if (this._id){
      // this.getDiscount(this._id).then((data) => {
        // this.discountForm.patchValue(data);
        // this.loading.dismiss();
      // });
    } else {
      this.loading.dismiss();
    }
    // this.buttonSave();

  }

  changedPercent(){
    if (! this.changing){
      this.changing = true;
      let discount_amount = this.amount_original*this.discountForm.value.discount_percent/100
      let new_amount = this.amount_original - discount_amount;
      console.log("changedPercent", new_amount);
      this.discountForm.patchValue({
        discount_amount: discount_amount.toFixed(this.currency_precision),
        new_amount: new_amount.toFixed(this.currency_precision),
      })
      setTimeout(() => {
        this.changing = false;
      }, 30);
    }
  }
  changedAmount(){
    if (! this.changing){
      this.changing = true;
      let discount_percent = 100*(this.discountForm.value.discount_amount/this.amount_original)
      console.log("changedAmount", this.discountForm.value.discount_amount/this.amount_original);
      let new_amount = this.amount_original - this.discountForm.value.discount_amount;
      this.discountForm.patchValue({
        discount_percent: discount_percent.toFixed(0),
        new_amount: new_amount.toFixed(this.currency_precision),
      })
      setTimeout(() => {
        this.changing = false;
      }, 30);
    }
  }
  changedNew(){
    if (! this.changing){
      console.log("changedNew");
      this.changing = true;
      let discount_percent = 100*(1 - this.discountForm.value.new_amount/this.amount_original)
      let discount_amount = this.amount_original - this.discountForm.value.new_amount;
      console.log("changedPercent", discount_amount);
      this.discountForm.patchValue({
        discount_percent: discount_percent.toFixed(0),
        discount_amount: discount_amount.toFixed(this.currency_precision),
      })
      setTimeout(() => {
        this.changing = false;
      }, 30);
    }
  }

  changedDocument(){
    let dv = this.discountForm.value.document.split('-')[1] || '';
    if (dv && dv.length == 1){
      console.log("ruc", this.discountForm.value.document);
      // this.getLegalName();
    }
  }

  buttonSave() {
    if (this._id){
      // this.updateDiscount(this.discountForm.value);
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/discount-list');
        // .then(() => {
          this.events.publish('open-discount', this.discountForm.value);
        // });
      }
    } else {
      // this.createDiscount(this.discountForm.value).then((doc: any) => {
      //   console.log("create discount", doc);
      //   this._id = doc.doc.id;
      //   if (this.select){
      //     this.events.publish('create-discount', this.discountForm.value);
      //     this.modalCtrl.dismiss();
      //   } else {
      //     this.navCtrl.navigateBack('/discount-list');
      //       this.events.publish('create-discount', this.discountForm.value);
      //   }
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
      { type: 'required', message: 'El Nombre es un campo Necesario' }
    ],
    'document': [
      { type: 'pattern', message: 'Use solo numeros y "-" por ejemplo: 4444444-4.' },
    ],
  };

  onSubmit(values){
    //console.log("teste", values);
  }


  ionViewDidEnter() {
    setTimeout(() => {
      this.new_amount.setFocus();
    }, 200);
  }
  createDiscount(discount){
    return new Promise((resolve, reject)=>{
      discount.docType = 'discount';
      if (discount.code != ''){
        console.log("sin code", discount.code);
        this.pouchdbService.createDoc(discount).then(doc => {
          resolve({doc: doc, discount: discount});
        });
      } else {
        // this.configService.getSequence('discount').then((code) => {
        //   discount['code'] = code;
          this.pouchdbService.createDoc(discount).then(doc => {
            resolve({doc: doc, discount: discount});
          });
        // });
      }
    });
  }

  updateDiscount(discount){
    discount.docType = 'discount';
    return this.pouchdbService.updateDoc(discount);
  }

  goNextStep() {
  // if (this.discountForm.value.state == 'DRAFT'){
    // if (this.discountForm.value.name==null){
    //   this.name.setFocus();
    // }
    // else if (this.discountForm.value.document==null){
    //   this.document.setFocus();
    // }
    // else if (this.discountForm.value.phone==null){
    //   this.phone.setFocus();
    // }
    // else if (this.discountForm.value.address==null){
    //   this.address.setFocus();
    // }
    // else if (this.discountForm.value.employee==true&&this.discountForm.value.salary==null){
    //   this.salary.setFocus();
    // }
    // else if (this.discountForm.value.document&&!this.discountForm.value.name_legal){
    //   this.getLegalName();
    //   // return;
    // }
    // else if (this.discountForm.dirty) {
    //   this.justSave();
    // } else {
    //   if (this.opened){
    //     this.navCtrl.navigateBack('discounts').then(() => {
    //       this.events.publish('open-discount', this.discountForm.value);
    //     });
    //   } else {
    //     this.navCtrl.navigateBack('discounts').then(() => {
    //       this.events.publish('create-discount', this.discountForm.value);
    //     });
    //   }
    // }
  }

  showNextButton(){
    // console.log("stock",this.discountForm.value.stock);
    if (this.discountForm.value.name==null){
      return true;
    }
    else if (this.discountForm.value.document==null){
      return true;
    }
    else if (this.discountForm.value.phone==null){
      return true;
    }
    else if (this.discountForm.value.address==null){
      return true;
    }
    else if (this.discountForm.value.employee==true&&this.discountForm.value.salary==null){
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
      if(this.discountForm.dirty) {
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
      // this.discountForm.markAsPristine();
      this.navCtrl.navigateBack('/discount-list');
    }
  }
}
