import { Component, OnInit } from '@angular/core';
import {
  NavController, ModalController, LoadingController, Events,
  AlertController
} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
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
    public activityService: ActivityService,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  async ngOnInit() {
    this.activityForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      fields: new FormControl([]),
      note: new FormControl(''),
      summary: new FormControl(),
      saveScript: new FormControl(),
      show: new FormControl(true),
      type: new FormControl('area'),
      _id: new FormControl(''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    if (this._id) {
      this.activityService.getActivity(this._id).then((data) => {
        this.activityForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  async addField() {
    let profileModal = await this.modalCtrl.create({
      component: FieldPage,
      componentProps: {}
    });
    profileModal.onDidDismiss().then(data => {
      if (data.data) {
        this.activityForm.value.fields.unshift(data.data)
        this.activityForm.markAsDirty();
      }
    });
    profileModal.present();
  }
  async editField(item) {
    let profileModal = await this.modalCtrl.create({
      component: FieldPage,
      componentProps: item
    });
    profileModal.onDidDismiss().then(data => {
      if (data.data) {
        Object.keys(data.data).forEach(key => {
          item[key] = data.data[key];
        })
        this.activityForm.markAsDirty();
      }
    });
    profileModal.present();
  }
  removeField(item) {
    let index = this.activityForm.value.fields.indexOf(item)
    this.activityForm.value.fields.splice(index, 1);
    this.activityForm.markAsDirty();
  }

  buttonSave() {
    if (this._id) {
      this.activityService.updateActivity(this.activityForm.value);
      if (this.select) {
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/activitys');
      }
      this.events.publish('open-activity', this.activityForm.value);
    } else {
      this.activityService.createActivity(this.activityForm.value).then((doc: any) => {
        this.activityForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        if (this.select) {
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/activitys');
        }
        this.events.publish('create-activity', this.activityForm.value);
      });
    }
  }

  setLanguage(lang: LanguageModel) {
    let language_to_set = this.translate.getDefaultLang();

    if (lang) {
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

  onSubmit(values) {
    //console.log("teste", values);
  }

  discard() {
    this.canDeactivate();
  }
  async canDeactivate() {
    if (this.activityForm.dirty) {
      let alertPopup = await this.alertCtrl.create({
        header: this.translate.instant('DISCARD'),
        message: this.translate.instant('SURE_DONT_SAVE'),
        buttons: [{
          text: this.translate.instant('YES'),
          handler: () => {
            this.exitPage();
          }
        },
        {
          text: this.translate.instant('NO'),
          handler: () => { }
        }]
      });
      alertPopup.present();
      return false;
    } else {
      this.exitPage();
    }
  }

  private exitPage() {
    if (this.select) {
      this.modalCtrl.dismiss();
    } else {
      this.activityForm.markAsPristine();
      this.navCtrl.navigateBack('/activitys');
    }
  }
}
