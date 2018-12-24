import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.page.html',
  styleUrls: ['./product-category.page.scss'],
})
export class ProductCategoryPage implements OnInit {
  categoryForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public navParams: NavParams,
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    // this._id = this.navParams.data._id;
    this._id = this.route.snapshot.paramMap.get('_id')
  }

  ngOnInit() {
    this.categoryForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      // dre:  new FormControl('sale'),
      note: new FormControl(''),
      _id: new FormControl(''),
    });
    if (this._id){
      this.getCategory(this._id).then((data) => {
        //let currentLang = this.translate.currentLang;
        this.categoryForm.patchValue(data);
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
  //     this.getCategory(this._id).then((data) => {
  //       //let currentLang = this.translate.currentLang;
  //       this.categoryForm.patchValue(data);
  //       //this.loading.dismiss();
  //     });
  //   } else {
  //     //this.loading.dismiss();
  //   }
  // }

  buttonSave() {
    if (this._id){
      this.updateCategory(this.categoryForm.value);
      this.navCtrl.navigateBack('/product-category-list').then(() => {
        this.events.publish('open-category', this.categoryForm.value);
      });
    } else {
      this.createCategory(this.categoryForm.value);
      this.navCtrl.navigateBack('/product-category-list').then(() => {
        this.events.publish('create-category', this.categoryForm.value);
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

  getCategory(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createCategory(category){
    category.docType = 'category';
    return this.pouchdbService.createDoc(category);
  }

  updateCategory(category){
    category.docType = 'category';
    return this.pouchdbService.updateDoc(category);
  }

}