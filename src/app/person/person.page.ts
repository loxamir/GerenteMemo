import { Component, OnInit, ViewChild, NgZone, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  NavController, ModalController, LoadingController,
  AlertController, Events, PopoverController, Platform,
  ActionSheetController, ToastController
} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { PersonService } from './person.service';
import { WorkPage } from '../work/work.page';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
import { CropsPage } from '../crops/crops.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { PersonPopover } from './person.popover';
declare var ApiAIPromises: any;

import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ImageModalPage } from '../image-modal/image-modal.page';
import { WorksService } from '../works/works.service';
import { PurchasePage } from '../purchase/purchase.page';
import { CashMovePage } from '../cash-move/cash-move.page';
import { StockMovePage } from '../stock-move/stock-move.page';
import { SalePage } from '../sale/sale.page';
import { ReceiptPage } from '../receipt/receipt.page';
import { ServicePage } from '../service/service.page';
import { PlannedListPage } from '../planned-list/planned-list.page';

@Component({
  selector: 'app-person',
  templateUrl: './person.page.html',
  styleUrls: ['./person.page.scss'],
})
export class PersonPage implements OnInit {
  @ViewChild('pwaphoto', { static: false }) pwaphoto: ElementRef;
  @ViewChild('pwacamera', { static: false }) pwacamera: ElementRef;
  @ViewChild('pwagalery', { static: false }) pwagalery: ElementRef;
  personForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  today: any;
  showForm = false;
  isCordova = false;
  diffDays = 0;
  showBotom = false;
  imgURI: string = null;
  images = [];
  skip = 0;
  lastWork = '0';
  avatar = undefined;
  currency_precision = 2;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public popoverCtrl: PopoverController,
    public personService: PersonService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public worksService: WorksService,
    public pouchdbService: PouchdbService,
    public events: Events,
    public formatService: FormatService,
    public ngZone: NgZone,
    public platform: Platform,
    public speechRecognition: SpeechRecognition,
    public tts: TextToSpeech,
    public actionSheetController: ActionSheetController,
    private camera: Camera,
    private file: File,
    private http: HttpClient,
    private webview: WebView,
    private filePath: FilePath,
    public toastCtrl: ToastController,
    private storage: Storage,
    private ref: ChangeDetectorRef,
  ) {
    this.today = new Date().toISOString();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.events.subscribe('changed-sale', (change) => {
      this.personService.handleChange(this.personForm.value.moves, change);
    })
    this.events.subscribe('changed-purchase', (change) => {
      this.personService.handleChange(this.personForm.value.moves, change);
    })
    this.events.subscribe('changed-service', (change) => {
      this.personService.handleChange(this.personForm.value.moves, change);
    })
    this.events.subscribe('changed-cash-move', (change) => {
      this.personService.handleChange(this.personForm.value.moves, change);
    })
    this.events.subscribe('changed-receipt', (change) => {
      this.personService.handleChange(this.personForm.value.moves, change);
    })
    this.events.subscribe('changed-work', (change) => {
      this.personService.handleChange(this.personForm.value.moves, change);
    })
    this.events.subscribe('changed-picture', (change) => {
      this.personService.handleChange(this.personForm.value.moves, change);
    })
    // platform.ready().then(() => {
    //   if (this.platform.is('cordova')) {
    //     this.isCordova = true;
    //     ApiAIPromises.init({
    //       clientAccessToken: "9f4e551a24734d02b3242c6e365c49a5"
    //     })
    //       .then((result) => console.log("result1", result))
    //   }
    // })
  }

  goBack() {
    this.navCtrl.navigateBack(['/agro-tabs/person-list']);
  }

  previewFile() {
    let self = this;
    var preview: any = document.querySelector('#imageSrc');
    var file = this.pwaphoto.nativeElement.files[0];
    var reader = new FileReader();
    reader.onload = (event: Event) => {
      preview.src = reader.result;
      this.personForm.patchValue({
        image: reader.result,
      })
      preview.onload = function() {

        var percentage = 1;
        let max_diameter = (800 ** 2 + 600 ** 2) ** (1 / 2);
        var image_diameter = (preview.height ** 2 + preview.width ** 2) ** (1 / 2)
        console.log("preview.height", preview.height)
        console.log("preview.width", preview.width)
        console.log("image_diameter", image_diameter)
        console.log("max_diameter", max_diameter)
        console.log("max_diameter/image_diameter", max_diameter / image_diameter)
        if (image_diameter > max_diameter) {
          percentage = max_diameter / image_diameter
        }
        console.log("percent", percentage);

        var canvas: any = window.document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        canvas.height = canvas.width * (preview.height / preview.width);
        var oc = window.document.createElement('canvas');
        var octx = oc.getContext('2d');
        oc.width = preview.width * percentage;
        oc.height = preview.height * percentage;
        canvas.width = oc.width;
        canvas.height = oc.height;
        octx.drawImage(preview, 0, 0, oc.width, oc.height);
        octx.drawImage(oc, 0, 0, oc.width, oc.height);
        ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.width, canvas.height);

        let jpg = ctx.canvas.toDataURL("image/jpeg");
        console.log("jpg", jpg);
        fetch(jpg)
          .then(res => res.blob())
          .then(blob => self.avatar = blob)
      }
    }

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  takeCamera() {
    let self = this;
    var preview: any = document.querySelector('#imgtmp');
    var file = this.pwacamera.nativeElement.files[0];
    var reader = new FileReader();
    reader.onload = (event: Event) => {
      preview.src = reader.result;
      preview.onload = async function() {
        var percentage = 1;
        let max_diameter = (800 ** 2 + 600 ** 2) ** (1 / 2);
        var image_diameter = (preview.height ** 2 + preview.width ** 2) ** (1 / 2)

        if (image_diameter > max_diameter) {
          percentage = max_diameter / image_diameter
        }
        var canvas: any = window.document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        canvas.height = canvas.width * (preview.height / preview.width);
        var oc = window.document.createElement('canvas');
        var octx = oc.getContext('2d');
        oc.width = preview.width * percentage;
        oc.height = preview.height * percentage;
        canvas.width = oc.width;
        canvas.height = oc.height;
        octx.drawImage(preview, 0, 0, oc.width, oc.height);
        octx.drawImage(oc, 0, 0, oc.width, oc.height);
        ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.width, canvas.height);
        let jpg = ctx.canvas.toDataURL("image/jpeg");
        console.log("jpg", jpg);
        let attachment = {};
        attachment['image.png'] = {
          content_type: 'image/jpg',
          data: jpg.split(';base64,')[1]
        }
        let work: any = await self.pouchdbService.createDoc({
          'docType': 'picture',
          'date': new Date().toISOString(),
          'person_id': self.personForm.value._id,
          'person_name': self.personForm.value.name,
          'activity_name': "Foto",
          'activity_id': "activity.picture",
          'note': self.personForm.value.note,
          '_attachments': attachment,
        })
        self.personForm.value.note = "";
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  takeGalery() {
    let self = this;
    var preview: any = document.querySelector('#imgtmp');
    var file = this.pwagalery.nativeElement.files[0];
    var reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
    }
    reader.onload = (event: Event) => {
      preview.src = reader.result;

      preview.onload = async function() {
        var percentage = 1;
        let max_diameter = (800 ** 2 + 600 ** 2) ** (1 / 2);
        var image_diameter = (preview.height ** 2 + preview.width ** 2) ** (1 / 2)
        console.log("preview.height", preview.height)
        console.log("preview.width", preview.width)
        console.log("image_diameter", image_diameter)
        console.log("max_diameter", max_diameter)
        console.log("max_diameter/image_diameter", max_diameter / image_diameter)
        if (image_diameter > max_diameter) {
          percentage = max_diameter / image_diameter
        }
        console.log("percent", percentage);
        var canvas: any = window.document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        canvas.height = canvas.width * (preview.height / preview.width);
        var oc = window.document.createElement('canvas');
        var octx = oc.getContext('2d');
        oc.width = preview.width * percentage;
        oc.height = preview.height * percentage;
        canvas.width = oc.width;
        canvas.height = oc.height;
        octx.drawImage(preview, 0, 0, oc.width, oc.height);
        octx.drawImage(oc, 0, 0, oc.width, oc.height);
        ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.width, canvas.height);
        let jpg = ctx.canvas.toDataURL("image/jpeg");
        console.log("jpg", jpg);
        let attachment = {};
        attachment['image.png'] = {
          content_type: 'image/jpg',
          data: jpg.split(';base64,')[1]
        }
        let work: any = await self.pouchdbService.createDoc({
          'docType': 'picture',
          'date': new Date().toISOString(),
          'person_id': self.personForm.value._id,
          'person_name': self.personForm.value.name,
          'activity_name': "Foto",
          'activity_id': "activity.picture",
          'note': self.personForm.value.note,
          '_attachments': attachment,
        })
        self.personForm.value.note = "";


      }
    };


  }

  openPWAPhotoPicker() {
    if (this.pwaphoto == null) {
      return;
    }

    this.pwaphoto.nativeElement.click();
  }

  openPWACamera() {
    if (this.pwacamera == null) {
      return;
    }

    this.pwacamera.nativeElement.click();
  }

  openPWAGalery() {
    if (this.pwagalery == null) {
      return;
    }

    this.pwagalery.nativeElement.click();
  }

  showEdit() {
    this.showForm = !this.showForm;
  }

  backEdit() {
    if (this._id) {
      this.showForm = false;
    } else {
      this.navCtrl.navigateBack(['/agro-tabs/person-list']);
    }
  }

  ask(question) {
    console.log("question", question);
    ApiAIPromises.requestText({
      query: question,
      contexts: [{
        name: "Person", parameters: {
          "person_name": this.personForm.value.name,
          "person_id": this.personForm.value._id
        }
      }]
    })
      .then((result) => {
        console.log("resultad", result);
        this.ngZone.run(() => {
          this.tts.speak({
            text: result.result.fulfillment.speech,
            //rate: this.rate/10,
            locale: "pt-BR"
          }).then(() => {
            if (result.result.actionIncomplete) {
              this.listenRequest();
            }
          })
        });
      }, (tset) => {
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
          });
        }
      });
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: PersonPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    popover.present();
  }

  async ngOnInit() {
    this.personForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      crop: new FormControl({}),
      crop_name: new FormControl(''),
      surface: new FormControl(0),
      own: new FormControl(true),
      rentingType: new FormControl('fixedAmount'),
      rentingAmount: new FormControl(0),
      contact: new FormControl({}),
      contact_name: new FormControl(''),
      image: new FormControl(''),
      moves: new FormControl([]),
      lastRain: new FormControl(0),
      lastRainDate: new FormControl(),
      note: new FormControl(""),
      code: new FormControl(''),
      _attachments: new FormControl({}),
      _id: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config: any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    if (this._id) {
      this.personService.getPerson(this._id).then(async (data) => {
        this.doInfinite(false);
        data.note = '';
        this.personForm.patchValue(data);
        this.loading.dismiss();
        let rain = await this.personService.getPersonRain(this._id);
        if (rain) {
          this.personForm.value.lastRainDate = rain['date'];
          this.personForm.value.lastRain = rain['quantity'];
          var date1 = new Date(this.personForm.value.lastRainDate);
          var date2 = new Date();
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
          this.diffDays = diffDays - 1;
        }
      });
    } else {
      this.showForm = true;
      this.loading.dismiss();
    }
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.personService.getWorksPage(this._id, this.skip).then((works: any[]) => {
        works.forEach(wor => {
          this.personForm.value.moves.push(wor);
        })
        console.log("this.personForm.value.moves", this.personForm.value.moves);
        this.skip += 15;
        if (infiniteScroll) {
          infiniteScroll.target.complete();
          if (works.length < 15) {
            infiniteScroll.target.disabled = true;
          }
        }
      });
    }, 50);
  }

  buttonSave() {
    if (this._id) {
      this.personService.updatePerson(this.personForm.value, this.avatar);
      this.events.publish('open-person', this.personForm.value);
      this.showForm = false;
    } else {
      this.personService.createPerson(this.personForm.value, this.avatar).then(doc => {
        this.personForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.events.publish('create-person', this.personForm.value);
        this.showForm = false;
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


  async openItem(item) {
    this.events.subscribe('open-person-move', (data) => {
      item.amount = data.amount;
      item.date = data.date;
      this.events.unsubscribe('open-person-move');
    });
    let component:any = WorkPage;
    let docType = item._id.split(".")[0];
    if (docType == 'purchase'){
      component = PurchasePage;
    } else if (docType == 'cash-move'){
      component = CashMovePage;
    } else if (docType == 'stock-move'){
      component = StockMovePage;
    } else if (docType == 'sale'){
      component = SalePage;
    } else if (docType == 'receipt'){
      component = ReceiptPage;
    }
    let profileModal = await this.modalCtrl.create({
      component: component,
      componentProps: {
        "_id": item._id,
        "select": true,
      }
    });
    profileModal.present();
  }

  async addActivity(activity_id) {
    let componentProps = {
      "person": this.personForm.value,
      "select": true,
    }
    if (activity_id) {
      componentProps['activity'] = await this.pouchdbService.getDoc(activity_id);
      componentProps['note'] = this.personForm.value.note;
    }
    let profileModal = await this.modalCtrl.create({
      component: WorkPage,
      componentProps: componentProps
    });
    profileModal.present();
  }

  async createSale() {
    let componentProps = {
      "contact": this.personForm.value,
      "select": true,
    }
    // if (activity_id) {
    //   componentProps['activity'] = await this.pouchdbService.getDoc(activity_id);
    //   componentProps['note'] = this.personForm.value.note;
    // }
    // componentProps['contact'] = await this.pouchdbService.getDoc(this._id);
    let profileModal = await this.modalCtrl.create({
      component: SalePage,
      componentProps: componentProps
    });
    profileModal.present();
  }

  async createPurchase() {
    let componentProps = {
      "contact": this.personForm.value,
      "select": true,
    }
    // if (activity_id) {
    //   componentProps['activity'] = await this.pouchdbService.getDoc(activity_id);
    //   componentProps['note'] = this.personForm.value.note;
    // }
    // componentProps['contact'] = await this.pouchdbService.getDoc(this._id);
    let profileModal = await this.modalCtrl.create({
      component: PurchasePage,
      componentProps: componentProps
    });
    profileModal.present();
  }

  async createService() {
    let componentProps = {
      "contact": this.personForm.value,
      "select": true,
    }
    // if (activity_id) {
    //   componentProps['activity'] = await this.pouchdbService.getDoc(activity_id);
    //   componentProps['note'] = this.personForm.value.note;
    // }
    // componentProps['contact'] = await this.pouchdbService.getDoc(this._id);
    let profileModal = await this.modalCtrl.create({
      component: ServicePage,
      componentProps: componentProps
    });
    profileModal.present();
  }

  async createPayment() {
    let componentProps = {
      "contact": this.personForm.value,
      "select": true,
      "signal": "-",
      "contact_id": this.personForm.value._id,
    }
    let profileModal = await this.modalCtrl.create({
      component: PlannedListPage,
      componentProps: componentProps
    });
    profileModal.present();
  }

  async createReception() {
    let componentProps = {
      "contact": this.personForm.value,
      "select": true,
      "signal": "+",
      "contact_id": this.personForm.value._id,
    }
    let profileModal = await this.modalCtrl.create({
      component: PlannedListPage,
      componentProps: componentProps
    });
    profileModal.present();
  }

  async createCashMove() {
    let componentProps = {
      "contact": this.personForm.value,
      "select": true,
    }
    let profileModal = await this.modalCtrl.create({
      component: CashMovePage,
      componentProps: componentProps
    });
    profileModal.present();
  }



  selectCrop() {
    return new Promise(async resolve => {
      this.events.unsubscribe('select-crop');
      this.events.subscribe('select-crop', (data) => {
        this.personForm.patchValue({
          crop: data,
          crop_name: data.name,
        });
        this.personForm.markAsDirty();
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

  addButton() {
    this.showBotom = !this.showBotom;
  }
  sendButton() {
    console.log("send");
    this.pouchdbService.createDoc({
      'docType': 'work',
      'date': new Date().toISOString(),
      'person_id': this.personForm.value._id,
      'person_name': this.personForm.value.name,
      // 'crop_id': this.personForm.value.crop._id,
      // 'crop_name': this.personForm.value.crop.name,
      'activity_name': "Anotación",
      'activity_id': "activity.anotation",
      'note': this.personForm.value.note,
    })
    this.personForm.value.note = '';
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Pegar imagem da ",
      buttons: [{
        text: 'Galeria',
        handler: () => {
          this.openPWAGalery();
        }
      },
      {
        text: 'Camera',
        handler: () => {
          this.openPWACamera();
        }
      }
      ]
    });
    await actionSheet.present();
  }

  openPreview(item) {
    this.modalCtrl.create({
      component: ImageModalPage,
      componentProps: {
        img: 'data:image/png;base64,' + item._attachments['image.png'].data,
        name: this.personForm.value.name,
        note: item.note,
        date: item.date
      }
    }).then(modal => {
      modal.present();
    });
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      position: 'bottom',
      duration: 3000
    });
    toast.present();
  }

  getAudio() {
    console.log("get audio");
  }

  selectContact() {
    return new Promise(async resolve => {
      this.events.unsubscribe('select-contact');
      this.events.subscribe('select-contact', (data) => {
        this.personForm.patchValue({
          contact: data,
          contact_name: data.name,
        });
        this.personForm.markAsDirty();
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

  discard() {
    this.canDeactivate();
  }
  async canDeactivate() {
    if (this.personForm.dirty) {
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
    this.personForm.markAsPristine();
    this.navCtrl.navigateBack('/agro-tabs/person-list');
  }

  deleteWork(work) {
    // let index = this.personForm.value.moves.indexOf(work);
    this.worksService.deleteWork(work);
  }

}