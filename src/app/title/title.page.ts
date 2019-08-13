import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-title',
  templateUrl: './title.page.html',
  styleUrls: ['./title.page.scss'],
})
export class TitlePage implements OnInit {
  titleForm: FormGroup;
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
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  async ngOnInit() {
    this.titleForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      code: new FormControl(''),
      note: new FormControl(''),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    if (this._id) {
      this.getTitle(this._id).then((data) => {
        this.titleForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id) {
      this.updateTitle(this.titleForm.value);
      this.events.publish('open-title', this.titleForm.value);
    } else {
      this.createTitle(this.titleForm.value).then((doc: any) => {
        this.titleForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        this.events.publish('create-title', this.titleForm.value);
      });
    }
    if (this.select) {
      this.modalCtrl.dismiss();
    }
    else {
      this.navCtrl.navigateBack('/title-list');
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
  }

  getTitle(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createTitle(title) {
    title.docType = 'title';
    return this.pouchdbService.createDoc(title);
  }

  updateTitle(title) {
    title.docType = 'title';
    return this.pouchdbService.updateDoc(title);
  }

  discard() {
    this.canDeactivate();
  }

  async canDeactivate() {
    if (this.titleForm.dirty) {
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
      this.titleForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/sale-list');
    }
  }

}
