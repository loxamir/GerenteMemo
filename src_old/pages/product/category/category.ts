import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { CategoryService } from './category.service';

@Component({
  selector: 'category-page',
  templateUrl: 'category.html'
})
export class CategoryPage {
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
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public categoryService: CategoryService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
  }

  ionViewWillLoad() {
    this.categoryForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      dre:  new FormControl('sale'),
      note: new FormControl(''),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.categoryService.getCategory(this._id).then((data) => {
        //let currentLang = this.translate.currentLang;
        this.categoryForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.categoryService.updateCategory(this.categoryForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-category', this.categoryForm.value);
      });
    } else {
      this.categoryService.createCategory(this.categoryForm.value);
      this.navCtrl.navigateBack().then(() => {
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
}
