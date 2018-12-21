import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, ViewController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ActivityService } from './activity.service';
import { WorkFieldPage } from './field/field';

@Component({
  selector: 'activity-page',
  templateUrl: 'activity.html'
})
export class ActivityPage {

  activityForm: FormGroup;
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
    public activityService: ActivityService,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
  }

  ionViewWillLoad() {
    this.activityForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      // type: new FormControl('integer'),
      fields: new FormControl([]),
      label: new FormControl(''),
      document: new FormControl(''),
      code: new FormControl(''),
      email: new FormControl(''),
      note: new FormControl(''),
      image: new FormControl(''),
      customer: new FormControl(true),
      supplier: new FormControl(false),
      seller: new FormControl(false),
      employee: new FormControl(false),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    if (this._id){
      this.activityService.getActivity(this._id).then((data) => {
        this.activityForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  addField(){
    // if (this.activityForm.value.state=='QUOTATION'){
      let profileModal = this.modal.create(WorkFieldPage, {});
      profileModal.onDidDismiss(data => {
        if (data) {
          //console.log(data);
          this.activityForm.value.fields.unshift(data)
          // this.recomputeValues();
          // this.show_travels=true;
          this.activityForm.markAsDirty();
        }
      });
      profileModal.present();
    // }
  }
  editField(item){
    // if (this.activityForm.value.state=='QUOTATION'){
      let profileModal = this.modal.create(WorkFieldPage, item);
      profileModal.onDidDismiss(data => {
        if (data) {
          Object.keys(data).forEach(key => {
            item[key] = data[key];
          })
          // this.recomputeValues();
          this.activityForm.markAsDirty();
        }
      });
      profileModal.present();
    // }
  }
  removeField(item){
    // if (this.activityForm.value.state=='QUOTATION'){
      let index = this.activityForm.value.fields.indexOf(item)
      this.activityForm.value.fields.splice(index, 1);
      // this.recomputeValues();
    // }
  }

  buttonSave() {
    if (this._id){
      this.activityService.updateActivity(this.activityForm.value);
      this.navCtrl.pop().then(() => {
        this.events.publish('open-activity', this.activityForm.value);
      });
    } else {
      this.activityService.createActivity(this.activityForm.value).then((doc: any) => {
        //console.log("docss", doc);
        this.activityForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        this.navCtrl.pop().then(() => {
          this.events.publish('create-activity', this.activityForm.value);
        });
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
    //console.log("teste", values);
  }
}
