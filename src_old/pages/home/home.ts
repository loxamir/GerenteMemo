import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Platform, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { HomeService } from './home.service';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SalePage } from '../sale/sale';
import { ReportPage } from '../report/report';
import { PurchasePage } from '../purchase/purchase';
declare var ApiAIPromises: any;


@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {
  answer;
  answers = [];
  question;

  homeForm: FormGroup;
  loading: any;
  _id: string;

  languages: Array<LanguageModel>;

  matches: String[];
  isRecording = false;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    public platform: Platform,
    public homeService: HomeService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
    public ngZone: NgZone,
    public cd: ChangeDetectorRef,
    public speechRecognition: SpeechRecognition,
    public tts: TextToSpeech
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');

    platform.ready().then(() => {
      ApiAIPromises.init({
        clientAccessToken: "3cf05521a37142ff8c01a6b0337f575c"
      })
      .then((result) =>  console.log(result))
    });

  }

  isIos() {
    return this.platform.is('ios');
  }

  stopListening() {
    this.speechRecognition.stopListening().then(() => {
      this.isRecording = false;
    });
  }

  startListening() {
    let options = {
      language: 'pt-BR'
    }
    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => {
      if (!hasPermission) {
        this.speechRecognition.requestPermission();
      } else {
        this.speechRecognition.startListening(options).subscribe(matches => {
          this.matches = matches;
          this.question = matches[0];
          this.cd.detectChanges();
          this.ask();
        });
        this.isRecording = true;
      }
    });
  }

  read() {
    return this.tts.speak({
      text: this.answer,
      //rate: this.rate/10,
      locale: "pt-BR"
    })
    .then(() => console.log('Success1'))
    .catch((reason: any) => console.log(reason));
  }

  ask() {
    ApiAIPromises.requestText({
      query: this.question
    })
    .then(result => {
       this.ngZone.run(()=> {
         //console.log("result", JSON.stringify(result));
         this.answers.push(result['result']['resolvedQuery']);
         this.answers.push(result['result']['fulfillment']['speech']);
         //console.log("speech", result['result']['fulfillment']['speech']);
         this.answer = result['result']['fulfillment']['speech'];
         this.read().then(teste => {
           if (result['result']['actionIncomplete']){
             this.startListening();
           } else if (result['result']['metadata']['intentName'] == 'createSale'){
             this.navCtrl.navigateForward(SalePage,{'contact': {'name': result['result']['parameters']['given-name']}});
           } else if (result['result']['metadata']['intentName'] == 'createPurchase'){
             let items = []
             // result['result']['parameters']['category'].forEach(category => {
               items.push({
                 'product': {
                   'name': result['result']['parameters']['category']
                 },
                 'description': result['result']['parameters']['category'],
                 'price': result['result']['parameters']['number'],
                 'quantity': 1,
               });
             // })
             this.navCtrl.navigateForward(PurchasePage,{'items': items});
           } else if (result['result']['metadata']['intentName'] == 'saleReport'){
             this.navCtrl.navigateForward(ReportPage,{'compute': true});
           }
           if (result['result']['action'] == 'moreProducts' && !result['result']['actionIncomplete']){
             this.answers.push("Mais alguma coisa?");
             this.answer = "Mais alguma coisa?";
             this.read().then(asdf => {
               this.startListening();
             });
           }
         });
       });
    })
  }

  //admob id ca-app-pub-8127146167878755~6724019825
  // ca-app-pub-8127146167878755/3860933204

  ionViewWillLoad() {
    this.homeForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      value: new FormControl(0),
      attributes: new FormControl([]),
      expenses: new FormControl([]),
      category: new FormControl({}),
      note: new FormControl(''),
      image: new FormControl(''),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.homeService.getHome(this._id).then((data) => {
        this.homeForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
    this.answer = "Em que posso ajudar-lo?";
    this.read().then(asdf => {
      this.startListening();
    });
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
    //console.log(values);
  }
}
