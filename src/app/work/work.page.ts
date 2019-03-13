import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController,  LoadingController, AlertController,
  Events, ToastController, ModalController,
} from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { Printer, PrintOptions } from '@ionic-native/printer';
// import { SpeechRecognition } from '@ionic-native/speech-recognition';
// import { TextToSpeech } from '@ionic-native/text-to-speech';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { WorkService } from './work.service';
// import { AssetsPage } from '../asset/list/assets';
import { ProductService } from '../product/product.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConfigService } from '../config/config.service';
import { ReceiptService } from '../receipt/receipt.service';
import { FormatService } from '../services/format.service';
import { ActivitysPage } from '../activitys/activitys.page';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductListPage } from '../product-list/product-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
// import { ProjectsPage } from '../project/list/projects';
import { StockMoveService } from '../stock-move/stock-move.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-work',
  templateUrl: './work.page.html',
  styleUrls: ['./work.page.scss'],
})
export class WorkPage implements OnInit {

  workForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  avoidAlertMessage: boolean;
  languages: Array<LanguageModel>;
  fields: any = {};
  list: boolean = false;
  activity;
  workData;
  select;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public workService: WorkService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public ProductService: ProductService,
    public ReceiptService: ReceiptService,
    public bluetoothSerial: BluetoothSerial,
    public toastCtrl: ToastController,
    public printer: Printer,
    public configService: ConfigService,
    public formatService: FormatService,
    public pouchdbService: PouchdbService,
    public events: Events,
    public modalCtrl: ModalController,
    // public speechRecognition: SpeechRecognition,
    // public tts: TextToSpeech,
    public stockMoveService: StockMoveService,

    // private renderer: Renderer,
    private elementRef: ElementRef
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.today = new Date().toISOString();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.list = eval(this.route.snapshot.paramMap.get('list'));
    this.activity = this.route.snapshot.paramMap.get('activity');
    this.avoidAlertMessage = false;
    this.workData = this.route.snapshot.data;
    console.log("paramaps", this.route.snapshot);
    this.select = this.route.snapshot.paramMap.get('select');
  }

  dismissData(){
    Object.keys(this.fields).forEach((field: any)=>{
      this.workForm.value[field] = this.fields[field] || this.workForm.value[field];
    })
    if (this.select){
      this.modalCtrl.dismiss(this.workForm.value);
    }
    // this.viewCtrl.dismiss(this.workForm.value);
  }

  filterFields(fieldsList) {
    let result = [];
    fieldsList.forEach(field => {
      if (!this.calculate(field.invisible)) {
        result.push(field);
      }
    });
    return result;
  }

  calculate(formula) {
    if (formula) {
      let result = eval(formula);
      return result;
    } else {
      return false;
    }
  }

  recomputeFields(){
    this.workForm.value.fields.forEach(field=>{
      this.fields[field.name] = this.calculate(field.formula);
    })
    this.workForm.value.fields.forEach(field=>{
      this.fields[field.name] = this.calculate(field.formula);
    })
  }

  async ngOnInit() {
    this.workForm = this.formBuilder.group({
      name: new FormControl(''),
      activity: new FormControl(this.activity||{}),
      code: new FormControl(''),
      date: new FormControl(this.today),
      note: new FormControl(''),
      state: new FormControl('QUOTATION'),
      language: new FormControl(''),
      fields: new FormControl([]),
      cost: new FormControl(0),
      _id: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    let self = this;
      if (this._id) {
        this.workService.getWork(this._id).then((data) => {
          data.fields.forEach(field => {
            this.workForm.addControl(
              field.name, new FormControl(data[field.name])
            );
          })
          this.workForm.patchValue(data);
          if (Object.keys(this.workForm.value.activity).length === 0
          && !this.activity) {
            this.selectActivity();
          }
          this.recomputeFields();
          this.loading.dismiss();
        });
      } else {
        this.loading.dismiss();
        if (Object.keys(this.workForm.value.activity).length === 0
        && !self.activity) {
          this.selectActivity();
        } else {
          this.setActivity(this.activity);
        }
      }
  }

  // async ionViewCanLeave() {
  //   if (this.workForm.dirty && ! this.avoidAlertMessage && ! this.list) {
  //     let alertPopup = await this.alertCtrl.create({
  //       // title: 'Descartar',
  //       message: '¿Deseas salir sin guardar?',
  //       buttons: [{
  //           text: 'Si',
  //           handler: () => {
  //             this.exitPage();
  //           }
  //         },
  //         {
  //           text: 'No',
  //           handler: () => {}
  //         }
  //       ]
  //     });
  //     alertPopup.present();
  //     return false;
  //   }
  // }
  //
  // private exitPage() {
  //   this.workForm.markAsPristine();
  //   this.navCtrl.navigateBack();
  // }

  buttonSave() {
    this.workForm.value.fields.forEach(field=>{
      if (field.type == 'formula'){
        this.workForm.value[field.name] = this.fields[field.name];
      }
    })
    if (this._id) {
      this.workService.updateWork(this.workForm.value);
      this.events.publish('open-work', this.workForm.value);
      this.workForm.markAsPristine();
    } else {
      this.workService.createWork(this.workForm.value).then(doc => {
        this.workForm.patchValue({
          _id: doc['doc'].id,
          code: doc['work'].code,
        });
        this._id = doc['doc'].id;
        this.events.publish('create-work', this.workForm.value);
        this.workForm.markAsPristine();
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

  onSubmit(values) {
    //console.log(values);
  }

  selectActivity() {
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-activity');
      this.events.subscribe('select-activity', (data) => {
        this.setActivity(data);
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ActivitysPage,
        componentProps: {
          "select": true,
          "filter": "customer"
        }
      });
      profileModal.present();
    });
  }

  setActivity(data){
    let self = this;
    console.log("setActivity", data);
    let data_fields = data.fields && data.fields.sort(function(a, b) {
      return self.formatService.compareField(a, b, 'sequence');
    }) || [];
    data_fields.forEach(field => {

      if (field.type == "boolean") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||false));
      } else if (field.type == "float") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||0));
      }
      else if (field.type == "string") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||""));
      }
      else if (field.type == "formula") {
        this.fields[field.name] = 0;
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||0));
      }
      else if (field.type == "date") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||this.today));
      }
      else if (field.type == "many2one") {
        this.workForm.addControl(
          field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||{})
        );
      } else if (field.type == "list") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||[]));
      }
    });
    this.workForm.patchValue({
      activity: data,
      fields: data.fields,
    });
    this.workForm.markAsDirty();
    this.avoidAlertMessage = false;
    this.events.unsubscribe('select-activity');
    this.goNextStep();
  }

  buttonPress(field) {
    let result = eval(field.script);
    return result;
  }

  sumListField(field_name, field='total'){
    let total = 0;
    let value = this.workForm.value[field_name].forEach((item: any)=>{
      total += parseFloat(item[field])
    })
    console.log("VALUE",total);
    return total;
  }

  selectM2O(field_name, model, context="{}") {
    context = JSON.parse(context || "{}");
    this.events.subscribe('select-' + model, (data) => {
      let field = {};
      field[field_name] = data;
      this.workForm.patchValue(field);
      this.recomputeFields();
      this.events.unsubscribe('select-' + model);
      this.workForm.markAsDirty();
      this.goNextStep();
    })
    switch (model) {
      case 'contact':
        this.showModal(ContactListPage, context)
        break;
      // case 'project':
      //   this.showModal(ProjectsPage, context)
      //   break;
      case 'product':
        this.showModal(ProductListPage, context)
        break;
    }
  }

  async showModal(page, context={}){
    context['select'] = true;
    let profileModal = await this.modalCtrl.create({
      component: page,
      componentProps: context
    });
    profileModal.present();
  }

  async addFieldItem(field_name){
    let field =  this.workForm.value[field_name];
    let activity = {};
    this.workForm.value.fields.forEach(variable => {
      if (variable.name == field_name){
        activity = variable.activity;
      }
    });
    let context = {};
    context["list"] = true;
    context["activity"] = activity;
    context["open"] = true;
    context["select"] = true;
    let profileModal = await this.modalCtrl.create({
      component: WorkPage,
      componentProps: context
    });
    profileModal.onDidDismiss().then(data => {
      console.log("dat12a", data.data);
      if (data.data) {
        field.push(data.data);
        this.workForm.markAsDirty();
        this.recomputeFields();
      }
    });
    profileModal.present();
  }

  async editFieldItem(field_name, item){
    let field =  this.workForm.value[field_name];
    let activity = {};
    this.workForm.value.fields.forEach(variable => {
      if (variable.name == field_name){
        activity = variable.activity;
      }
    });
    let context = this.workForm.value[field_name][item];
    context["list"] = true;
    context["activity"] = activity;
    context["select"] = true;
    let profileModal = await this.modalCtrl.create({
      component:WorkPage,
      componentProps: context
    });
    profileModal.onDidDismiss().then(data => {
      console.log("dat13a", data.data);
      if (data.data) {
        field[item] = data.data;
        this.workForm.markAsDirty();
      }
      this.recomputeFields();
    });
    profileModal.present();
  }

  removeFieldItem(field_name, item){
    this.workForm.value[field_name].splice(item, 1);
    this.workForm.markAsDirty();
  }

  goNextStep() {
    console.log("set Focus");
    let done = true;
    for (let field of this.workForm.value.fields) {
      // if (field.type == 'float'
      // || field.type == 'integer'
      // || field.type == 'string'){
      //   console.log("field.name", field.name);
      //   let element = this.elementRef.nativeElement.querySelector(
      //     '#teste'
      //   );
      //   console.log("element", element);
      //   if (element.value=="0" || element.value==""){
      //     // this.renderer.invokeElementMethod(element, 'focus', []);
      //     element.select();
      //     done = false;
      //     break;
      //   }
      // }
      // else
      if (field.type == 'date'){

      }
      else if (field.type == 'boolean'){

      }
      else if (field.type == 'many2one'){
        if (Object.keys(this.workForm.value[field.name]).length === 0){
          this.selectM2O(field.name, field.model, field.context);
          done = false;
          break;
        }
      }
      else if (field.type == 'list'){
        if (this.workForm.value[field.name].length === 0){
          this.addFieldItem(field.name)
          done = false;
          break;
        }
      }
      else if (field.type == 'button'){
        this.buttonPress(field);
        done = false;
        break;
      }
    }
    if (done && this.list) {

      this.dismissData()
    }
  }

  showNextButton(){
    // console.log("stock",this.workForm.value.stock);
    // if (this.workForm.value.name==null){
      return true;
    // }
    // else if (this.workForm.value.price==null){
    //   return true;
    // }
    // else if (this.workForm.value.cost==null){
    //   return true;
    // }
    // else if (this.workForm.value.type=='product'&&this.workForm.value.stock==null){
    //   return true;
    // }
    // else {
    //   return false;
    // }
  }
  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.workForm.dirty) {
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
      this.workForm.markAsPristine();
      this.navCtrl.navigateBack('/agro-tabs/work-list');
    }
  }

}