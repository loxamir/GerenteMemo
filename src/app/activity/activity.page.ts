import { Component, OnInit } from '@angular/core';
import { NavController,  ModalController, LoadingController, Events,
  AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ActivityService } from './activity.service';
import { FieldPage } from '../field/field.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit {

  activityForm: FormGroup;
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
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public activityService: ActivityService,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create({});
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  async ngOnInit() {
    this.activityForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      // type: new FormControl('integer'),
      fields: new FormControl([]),
      // label: new FormControl(''),
      // document: new FormControl(''),
      // code: new FormControl(''),
      // email: new FormControl(''),
      note: new FormControl(''),
      // image: new FormControl(''),
      // customer: new FormControl(true),
      // supplier: new FormControl(false),
      // seller: new FormControl(false),
      // employee: new FormControl(false),
      summary: new FormControl(),
      saveScript: new FormControl(),
      show: new FormControl(true),
      type: new FormControl('area'),
      _id: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    if (this._id){
      this.activityService.getActivity(this._id).then((data) => {
        this.activityForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  async addField(){
    // if (this.activityForm.value.state=='QUOTATION'){
      let profileModal = await this.modalCtrl.create({
        component: FieldPage,
        componentProps: {}
      });
      profileModal.onDidDismiss().then(data => {
        if (data.data) {
          //console.log(data);
          this.activityForm.value.fields.unshift(data.data)
          // this.recomputeValues();
          // this.show_travels=true;
          this.activityForm.markAsDirty();
        }
      });
      profileModal.present();
    // }
  }
  async editField(item){
      let profileModal = await this.modalCtrl.create({
        component: FieldPage,
        componentProps: item
      });
      profileModal.onDidDismiss().then(data => {
        if (data.data) {
          Object.keys(data.data).forEach(key => {
            item[key] = data.data[key];
          })
          // this.recomputeValues();
          this.activityForm.markAsDirty();
        }
      });
      profileModal.present();
  }
  removeField(item){
    // if (this.activityForm.value.state=='QUOTATION'){
      let index = this.activityForm.value.fields.indexOf(item)
      this.activityForm.value.fields.splice(index, 1);
      this.activityForm.markAsDirty();
      // this.recomputeValues();
    // }
  }

  buttonSave() {
    if (this._id){
      this.activityService.updateActivity(this.activityForm.value);
      // this.navCtrl.navigateBack().then(() => {
        if (this.select){
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/activitys');
        }
        this.events.publish('open-activity', this.activityForm.value);
      // });
    } else {
      this.activityService.createActivity(this.activityForm.value).then((doc: any) => {
        //console.log("docss", doc);
        this.activityForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        // this.navCtrl.navigateBack().then(() => {
        if (this.select){
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/activitys');
        }
          this.events.publish('create-activity', this.activityForm.value);
        // });
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

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.activityForm.dirty) {
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
      this.activityForm.markAsPristine();
      this.navCtrl.navigateBack('/activitys');
    }
  }
}
