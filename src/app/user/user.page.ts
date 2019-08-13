import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../config/config.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  form: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;
  select = true;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public configService: ConfigService,
    public pouchdbService: PouchdbService,
  ) { }

  async ngOnInit() {
    this.form = this.formBuilder.group({
      name: [this.navParams.data.name || ''],
      username: [this.navParams.data.username || ''],
      sale: [this.navParams.data.sale || false],
      purchase: [this.navParams.data.purchase || false],
      finance: [this.navParams.data.finance || false],
      service: [this.navParams.data.service || false],
      report: [this.navParams.data.report || false],
      config: [this.navParams.data.config || false],
      registered: [this.navParams.data.registered || false]
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }

  async buttonSave() {
    if (this.form.value.registered == true) {
      this.form.value.registered = true;
    }
    else {
      let user_code = await this.configService.getSequence('user');
      let createList = [{
        '_id': 'sequence.sale.' + this.form.value.username,
        'value': user_code + '-0001',
        'docType': 'sequence',
      },
      {
        '_id': 'sequence.purchase.' + this.form.value.username,
        'value': user_code + '-0001'
      },
      {
        '_id': 'sequence.invoice.' + this.form.value.username,
        'value': user_code + '-0001'
      },
      {
        '_id': 'sequence.service.' + this.form.value.username,
        'value': user_code + '-0001'
      },
      {
        '_id': 'sequence.receipt.' + this.form.value.username,
        'value': user_code + '-0001'
      }]
      this.pouchdbService.createDocList(createList);
    }
    this.modalCtrl.dismiss(this.form.value);
  }

  discard() {
    this.canDeactivate();
  }
  async canDeactivate() {
    if (this.form.dirty) {
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
          handler: () => {
          }
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
      this.form.markAsPristine();
      this.navCtrl.navigateBack('/product-list');
    }
  }
}
