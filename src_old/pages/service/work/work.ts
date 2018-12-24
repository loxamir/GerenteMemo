import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController,  Events, TextInput } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { ContactsPage } from '../../contact/list/contacts';

@Component({
  selector: 'work-page',
  templateUrl: 'work.html'
})
export class ServiceWorkPage {
@ViewChild('description') description: TextInput;
  workForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
    public speechRecognition: SpeechRecognition,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    // this._id = this.navParams.data._id;
  }

  ionViewWillLoad() {
    this.workForm = this.formBuilder.group({
      description: new FormControl(this.navParams.data.description||''),
      date: new FormControl(this.navParams.data.date||new Date().toISOString()),
      time: new FormControl(this.navParams.data.time||1),
      // note: new FormControl(this.navParams.data.note||''),
      responsible: new FormControl(this.navParams.data.responsible||''),
    });
  }

  ionViewDidLoad(){
    setTimeout(() => {
      this.description.setFocus();
    }, 700);
  }

  buttonSave(){
    // this.viewCtrl.dismiss(this.workForm.value);
  }

  selectResponsible() {
    return new Promise(resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-contact');
      this.events.subscribe('select-contact', (data) => {
        this.workForm.patchValue({
          responsible: data,
        });
        this.workForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-contact');
        resolve(true);
      })
      let profileModal = this.modal.create(ContactsPage, {"select": true, "filter": "employee"});
      profileModal.present();
    });
  }

  listenDescription() {
    let options = {
      language: 'pt-BR'
    }
    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => {
      if (!hasPermission) {
        this.speechRecognition.requestPermission();
      } else {
        this.speechRecognition.startListening(options).subscribe(matches => {
          this.workForm.patchValue({
            description: matches[0],
          });
          this.workForm.markAsDirty();
        });
      }
    });
  }
}
