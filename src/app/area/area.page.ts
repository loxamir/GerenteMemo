import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController,  ModalController, LoadingController,
   AlertController, Events, PopoverController, Platform } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { AreaService } from './area.service';
import { WorkPage } from '../work/work.page';
// import { AreaMoveService } from './move/area-move.service';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
import { CropsPage } from '../crops/crops.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { AreaPopover } from './area.popover';
declare var ApiAIPromises: any;
@Component({
  selector: 'app-area',
  templateUrl: './area.page.html',
  styleUrls: ['./area.page.scss'],
})
export class AreaPage implements OnInit {
@ViewChild('content') content;
  areaForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  create;
  select;
  today: any;
  showForm = false;
  showSearch;
  answer;
  showBotom = false;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public popoverCtrl: PopoverController,
    public areaService: AreaService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public events: Events,
    public formatService: FormatService,
    public ngZone: NgZone,
    public platform: Platform,
    public speechRecognition: SpeechRecognition,
    public tts: TextToSpeech,
  ) {
    this.today = new Date().toISOString();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');
    this.create = this.route.snapshot.paramMap.get('create');
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-work', (change)=>{
      console.log("chaNGE WORK", change);
      this.areaService.handleChange(this.areaForm.value.moves, change);
      setTimeout(() => {
        console.log("acounteceu");
        if (this.content){
          this.content.scrollToBottom();
        }
      }, 500);
    })
    platform.ready().then(() => {
      ApiAIPromises.init({
        clientAccessToken: "9f4e551a24734d02b3242c6e365c49a5"
      })
      .then((result) =>  console.log("result1", result))
    })
  }
  showEdit (){
    this.showForm = !this.showForm;
  }


  ask(question) {
    // question = question.replace('r$', 'reais');
    console.log("question", question);
    ApiAIPromises.requestText({
      query: question,
      contexts: [{ name: "Area", parameters: {
        "area_name": this.areaForm.value.name,
        "area_id": this.areaForm.value._id
      }}]
    })
    .then((result) => {
      console.log("resultad", result);
       this.ngZone.run(()=> {
         // this.answer = speech;
         // this.areaForm.value.moves.push({
         //   'docType': 'work',
         //   'date': new Date().toISOString(),
         //   'area_id': this.areaForm.value._id,
         //   'area_name': this.areaForm.value.name,
         //   'activity_name': "Memo",
         //   'note': result.result.fulfillment.speech,
         // })
         setTimeout(() => {
           if (this.content){
             this.content.scrollToBottom();
           }
         }, 200);
         this.tts.speak({
           text: result.result.fulfillment.speech,
           //rate: this.rate/10,
           locale: "pt-BR"
         }).then(()=>{
           if (result.result.actionIncomplete){
             this.listenRequest();
           }
         })
       });
    }, (tset)=>{
      console.log("return", tset);
    })
  }

  listenRequest() {
    let options = {
      language: 'pt-BR'
    }
    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => {
      if (!hasPermission) {
        this.speechRecognition.requestPermission();
      } else {
        this.speechRecognition.startListening(options).subscribe(matches => {
          console.log("matches", matches);
          this.ask(matches[0]);
          // this.areaForm.value.moves.push({
          //   'docType': 'work',
          //   'date': new Date().toISOString(),
          //   'area_id': this.areaForm.value._id,
          //   'area_name': this.areaForm.value.name,
          //   'activity_name': "Anotacion",
          //   'note': matches[0],
          // })
          setTimeout(() => {
            if (this.content){
              this.content.scrollToBottom();
            }
          }, 200);
        });
      }
    });
  }

  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: AreaPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    popover.present();

  }


  async ngOnInit() {
    this.areaForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      balance: new FormControl(0),
      crop: new FormControl({}),
      crop_name: new FormControl(''),
      surface: new FormControl(0),
      own: new FormControl(true),
      rentingType: new FormControl('fixedAmount'),
      rentingAmount: new FormControl(0),
      contact: new FormControl({}),
      contact_name: new FormControl(''),
      // currency_name: new FormControl(''),
      moves: new FormControl([]),
      // checks: new FormControl([]),
      // type: new FormControl('liquidity'),
      // sequence: new FormControl(1),
      note: new FormControl(null),
      code: new FormControl(''),
      _id: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    if (this._id){
      this.areaService.getArea(this._id).then((data) => {
        data.note = null;
        this.areaForm.patchValue(data);
        this.loading.dismiss();
        setTimeout(() => {
          if (this.content){
            this.content.scrollToBottom();
          }
        }, 200);
      });
    } else {
      this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.areaService.updateArea(this.areaForm.value);
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-area', this.areaForm.value);
        this.navCtrl.navigateBack('/agro-tabs/area-list');
      // });
    } else {
      this.areaService.createArea(this.areaForm.value).then(doc => {
        //console.log("docss", doc);
        this.areaForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-area', this.areaForm.value);
          this.navCtrl.navigateBack('/agro-tabs/area-list');
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


  async openItem(item) {
    this.events.subscribe('open-area-move', (data) => {
      item.amount = data.amount;
      item.date = data.date;
      this.events.unsubscribe('open-area-move');
    });
    let profileModal = await this.modalCtrl.create({
      component: WorkPage,
      componentProps: {
        "_id": item._id,
      }
    });
    profileModal.present();
  }

  itemSumary(item){
    let summary = item && item.summary || "";
    if (summary){
      let list = summary.split("${").splice(1);
      list.forEach(variable=>{
          variable = variable.split("}")[0];
          summary = summary.replace("${"+variable+"}", item[variable]);
      })
    }
    return summary;
  }

  async addActivity(activity_id){
    let componentProps = {
      "area": this.areaForm.value,
    }
    if (activity_id){
      componentProps['activity'] = await this.pouchdbService.getDoc(activity_id);
      componentProps['note'] = this.areaForm.value.note;
    }
    let profileModal = await this.modalCtrl.create({
      component: WorkPage,
      componentProps: componentProps
    });
    profileModal.present();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.areaService.getArea(this._id).then((data) => {
        this.areaForm.patchValue(data);
        //this.loading.dismiss();
      });
      refresher.target.complete();
    }, 200);
  }

  doRefreshList(){
    this.areaService.getArea(this._id).then((data) => {
      this.areaForm.patchValue(data);
      //this.loading.dismiss();
    });
  }

  onSubmit(values){
    //console.log(values);
  }

  selectCrop() {
      return new Promise(async resolve => {
        this.events.unsubscribe('select-crop');
        this.events.subscribe('select-crop', (data) => {
          this.areaForm.patchValue({
            crop: data,
            crop_name: data.name,
          });
          this.areaForm.markAsDirty();
          this.events.unsubscribe('select-crop');
          profileModal.dismiss();
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: CropsPage,
          componentProps: {
            "select": true,
          }
        });
        profileModal.present();
      });
  }

  addButton(){
    this.showBotom = !this.showBotom;
    if (this.showBotom){
      setTimeout(() => {
        if (this.content){
          this.content.scrollToBottom();
        }
      }, 200);
    }
  }
  sendButton(){
    console.log("send");
    // this.addActivity('activity.1536168428011');
    this.pouchdbService.createDoc({
      'docType': 'work',
      'date': new Date().toISOString(),
      'area_id': this.areaForm.value._id,
      'area_name': this.areaForm.value.name,
      'crop_id': this.areaForm.value.crop._id,
      'crop_name': this.areaForm.value.crop.name,
      'activity_name': "Anotacion",
      'activity_id': "activity.anotation",
      'note': this.areaForm.value.note,
    })
    this.areaForm.value.note = null;
    setTimeout(() => {
      if (this.content){
        this.content.scrollToBottom();
      }
    }, 500);
  }

  getPicture(){
    console.log("take picture");
  }
  getAudio(){
    if (this.content){
      this.content.scrollToBottom();
    }
    console.log("get audio");

  }



  selectContact() {
      return new Promise(async resolve => {
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.areaForm.patchValue({
            contact: data,
            contact_name: data.name,
          });
          this.areaForm.markAsDirty();
          this.events.unsubscribe('select-contact');
          profileModal.dismiss();
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: ContactListPage,
          componentProps: {
            "select": true,
          }
        });
        profileModal.present();
      });
  }


  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.areaForm.dirty) {
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
      this.areaForm.markAsPristine();
      this.navCtrl.navigateBack('/agro-tabs/area-list');
    }
  }

}
