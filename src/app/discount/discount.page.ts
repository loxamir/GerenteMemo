import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {
  NavController, ModalController, LoadingController, AlertController,
  Events
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.page.html',
  styleUrls: ['./discount.page.scss'],
})
export class DiscountPage implements OnInit {
  @ViewChild('discount_percent', { static: true }) discount_percent;
  @ViewChild('discount_amount', { static: true }) discount_amount;
  // @ViewChild('new_amount') new_amountField;

  discountForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  showProduct;
  amount_original: number;
  currency_precision = 2;
  changing = false;
  new_amount: number;
  discountProduct;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public alertCtrl: AlertController,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    
    
    
    this.showProduct = this.route.snapshot.paramMap.get('showProduct');
    this.discountProduct = this.route.snapshot.paramMap.get('discountProduct');
    this.amount_original = parseFloat(this.route.snapshot.paramMap.get('amount_original'));
    this.new_amount = parseFloat(this.route.snapshot.paramMap.get('new_amount'));
    this.currency_precision = parseInt(this.route.snapshot.paramMap.get('currency_precision'));
  }

  async ngOnInit() {
  let language = navigator.language.split('-')[0];
  this.translate.setDefaultLang(language);
  this.translate.use(language);
    // console.log("this.amount_original", this.amount_original, "this.new_amount", this.new_amount)
    let default_percent:any = 0;
    let discount_amount:any = 0;
    if (this.amount_original && this.new_amount && this.amount_original != this.new_amount){
      default_percent = (100*(1 - this.new_amount/this.amount_original))
      if (default_percent){
        default_percent = default_percent.toFixed(this.currency_precision);
      }
      discount_amount = this.amount_original - this.new_amount;
      if (discount_amount){
        discount_amount = discount_amount.toFixed(this.currency_precision);
      }
    }

    this.discountForm = this.formBuilder.group({
      discount_percent: new FormControl(default_percent || ''),
      discount_amount: new FormControl(discount_amount|| 0),
      new_amount: new FormControl(this.new_amount || 0),
      discountProduct: new FormControl(this.discountProduct || false),
    });
  }

  changedPercent() {
    if (!this.changing) {
      this.changing = true;
      let discount_amount = this.amount_original * this.discountForm.value.discount_percent / 100
      let new_amount = this.amount_original - discount_amount;
      // console.log("changedPercent", new_amount);
      this.discountForm.patchValue({
        discount_amount: discount_amount.toFixed(this.currency_precision),
        new_amount: new_amount.toFixed(this.currency_precision),
      })
      setTimeout(() => {
        this.changing = false;
      }, 10);
    }
  }

  changedAmount() {
    if (!this.changing) {
      this.changing = true;
      let discount_percent = 100 * (this.discountForm.value.discount_amount / this.amount_original)
      // console.log("changedAmount", this.discountForm.value.discount_amount / this.amount_original);
      let new_amount = this.amount_original - this.discountForm.value.discount_amount;
      this.discountForm.patchValue({
        discount_percent: discount_percent.toFixed(0),
        new_amount: new_amount.toFixed(this.currency_precision),
      })
      setTimeout(() => {
        this.changing = false;
      }, 10);
    }
  }
  changedNew() {
    if (!this.changing) {
      // console.log("changedNew");
      this.changing = true;
      let discount_percent = 100 * (1 - this.discountForm.value.new_amount / this.amount_original)
      let discount_amount = this.amount_original - this.discountForm.value.new_amount;
      // console.log("changedPercent", discount_amount);
      this.discountForm.patchValue({
        discount_percent: discount_percent.toFixed(0),
        discount_amount: discount_amount.toFixed(this.currency_precision),
      })
      setTimeout(() => {
        this.changing = false;
      }, 10);
    }
  }

  buttonSave() {
    this.modalCtrl.dismiss();
    if (!this.discountForm.value.discount_percent){
      this.discountForm.patchValue({
        'discountProduct': false
      })
    }
    this.events.publish('set-discount', this.discountForm.value);
  }

  setLanguage(lang: LanguageModel) {
    let language_to_set = this.translate.getDefaultLang();

    if (lang) {
      language_to_set = lang.code;
    }
    this.translate.setDefaultLang(language_to_set);
    this.translate.use(language_to_set);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.discount_percent.setFocus();
    }, 200);
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.discountForm.dirty) {
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
    this.modalCtrl.dismiss();
  }
}
