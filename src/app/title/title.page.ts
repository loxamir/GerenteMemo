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
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    // public titleService: TitleService,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,

    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ngOnInit() {
    this.titleForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      // address: new FormControl(''),
      // phone: new FormControl(''),
      // document: new FormControl(''),
      code: new FormControl(''),
      // email: new FormControl(''),
      note: new FormControl(''),
      // image: new FormControl(''),
      // customer: new FormControl(true),
      // supplier: new FormControl(false),
      // seller: new FormControl(false),
      // employee: new FormControl(false),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    if (this._id){
      this.getTitle(this._id).then((data) => {
        this.titleForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
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
    if (this.select){
      this.modalCtrl.dismiss();
    }
    else {
      this.navCtrl.navigateBack('/title-list');
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

  getTitle(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createTitle(title){
    title.docType = 'title';
    return this.pouchdbService.createDoc(title);
  }

  updateTitle(title){
    title.docType = 'title';
    return this.pouchdbService.updateDoc(title);
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.titleForm.dirty) {
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
      this.titleForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/sale-list');
    }
  }

}
