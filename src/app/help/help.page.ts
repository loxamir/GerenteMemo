import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  @ViewChild('content', { static: false }) content;
  helpForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    this._id = this.route.snapshot.paramMap.get('_id');
  }

  convert() {
    if(this.helpForm.value.editContent==false){
      if(this.helpForm.value.content && this.helpForm.value.content!=''){
        this.content =  this.helpForm.value.content.toString();
      }
    }
  }

  async ngOnInit() {
    this.helpForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      content: new FormControl(''),
      editContent: new FormControl(true),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    //this.loading.present();
    if (this._id){
      this.getHelp(this._id).then((data) => {
        this.helpForm.patchValue(data);
        this.convert();
        //this.loading.dismiss();
      });
    } else {
      this.convert();
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.updateHelp(this.helpForm.value);
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-help', this.helpForm.value);
      // });
    } else {
      this.createHelp(this.helpForm.value).then((doc: any) => {
        //console.log("docss", doc);
        this.helpForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-help', this.helpForm.value);
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

  getHelp(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createHelp(help){
    help.docType = 'help';
    return this.pouchdbService.createDoc(help);
  }

  updateHelp(help){
    help.docType = 'help';
    return this.pouchdbService.updateDoc(help);
  }

}
