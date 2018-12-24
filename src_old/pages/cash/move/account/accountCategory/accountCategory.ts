import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ImagePicker } from '@ionic-native/image-picker';
import { Crop } from '@ionic-native/crop';
import { AccountCategoryService } from './accountCategory.service';
import { TitlesPage } from './title/list/titles';

@Component({
  selector: 'accountCategory-page',
  templateUrl: 'accountCategory.html'
})
export class AccountCategoryPage {

  accountCategoryForm: FormGroup;
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
    public accountCategoryService: AccountCategoryService,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
  }

  ionViewWillLoad() {
    this.accountCategoryForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      type: new FormControl('receivable'),
      note: new FormControl(''),
      code: new FormControl(''),
      title: new FormControl({}),
      title_id: new FormControl(""),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.accountCategoryService.getAccountCategory(this._id).then((data) => {
        this.accountCategoryForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.accountCategoryService.updateAccountCategory(this.accountCategoryForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-accountCategory', this.accountCategoryForm.value);
      });
    } else {
      this.accountCategoryService.createAccountCategory(this.accountCategoryForm.value).then((doc: any) => {
        //console.log("docss", doc);
        this.accountCategoryForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-accountCategory', this.accountCategoryForm.value);
        });
      });
    }
  }

  selectTitle() {
    console.log("selectTitle");
    return new Promise(resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-title');
      this.events.subscribe('select-title', (data) => {
        this.accountCategoryForm.patchValue({
          title: data,
          // type: data.type,
        });
        this.accountCategoryForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-title');
        resolve(true);
      })
      let profileModal = this.modal.create(TitlesPage, {"select": true});
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
    //console.log("teste", values);
  }
}
