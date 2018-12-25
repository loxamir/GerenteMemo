import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController,  Events } from '@ionic/angular';
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

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    // public titleService: TitleService,
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
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-title', this.titleForm.value);
      // });
    } else {
      this.createTitle(this.titleForm.value).then((doc: any) => {
        //console.log("docss", doc);
        this.titleForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-title', this.titleForm.value);
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

}
