import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.page.html',
  styleUrls: ['./brand.page.scss'],
})
export class BrandPage implements OnInit {
  brandForm: FormGroup;
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
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
  ) {



    this.select = this.route.snapshot.paramMap.get('select');
    this._id = this.route.snapshot.paramMap.get('_id');
  }

  async ngOnInit() {
    this.brandForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      // dre:  new FormControl('sale'),
      note: new FormControl(''),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    if (this._id){
      this.getBrand(this._id).then((data) => {
        //let currentLang = this.translate.currentLang;
        this.brandForm.patchValue(data);
        this.brandForm.markAsPristine();
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  // ionViewDidLoad() {
  //   //this.loading.present();
  //   console.log("testess");
  //   if (this._id){
  //     this.getBrand(this._id).then((data) => {
  //       //let currentLang = this.translate.currentLang;
  //       this.brandForm.patchValue(data);
  //       //this.loading.dismiss();
  //     });
  //   } else {
  //     //this.loading.dismiss();
  //   }
  // }

  buttonSave() {
    if (this._id){
      this.updateBrand(this.brandForm.value);
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/brand-list');
        // .then(() => {
          this.events.publish('open-brand', this.brandForm.value);
        // });
      }
    } else {
      this.createBrand(this.brandForm.value);
      if (this.select){
        this.modalCtrl.dismiss();
        this.events.publish('create-brand', this.brandForm.value);
      } else {
        this.navCtrl.navigateBack('/brand-list');
        // .then(() => {
          this.events.publish('create-brand', this.brandForm.value);
        // });
      }
    }
  }

  discard(){
    this.canDeactivate();
  }

  async canDeactivate() {
      if(this.brandForm.dirty) {
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
    // console.log("exitPage", this.select);
      this.brandForm.markAsPristine();
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/brand-list');
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

  getBrand(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createBrand(brand){
    brand.docType = 'brand';
    return this.pouchdbService.createDoc(brand);
  }

  updateBrand(brand){
    brand.docType = 'brand';
    return this.pouchdbService.updateDoc(brand);
  }

}
