import { Component, ViewChild, ElementRef, OnInit, Input, ViewChildren } from '@angular/core';
import { NavController,  LoadingController, AlertController,
  Events, ToastController, ModalController,
} from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { WorkService } from './work.service';
import { ProductService } from '../product/product.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConfigService } from '../config/config.service';
import { ReceiptService } from '../receipt/receipt.service';
import { FormatService } from '../services/format.service';
import { ActivitysPage } from '../activitys/activitys.page';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductListPage } from '../product-list/product-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { AreasPage } from '../areas/areas.page';
import { MachinesPage } from '../machines/machines.page';
import { CropsPage } from '../crops/crops.page';
import { StockMoveService } from '../stock-move/stock-move.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-work',
  templateUrl: './work.page.html',
  styleUrls: ['./work.page.scss'],
})
export class WorkPage implements OnInit {
  @ViewChild('teste') pageFields: any[];
  workForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  languages: Array<LanguageModel>;
  fields: any = {};
  @Input() list: boolean = false;
  activity;
  @Input() data;
  select;
  @Input() go = false;

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
    public stockMoveService: StockMoveService,
    private elementRef: ElementRef
  ) {
    this.today = new Date().toISOString();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.activity = this.route.snapshot.paramMap.get('activity');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  dismissData(){
    Object.keys(this.fields).forEach((field: any)=>{
      this.workForm.value[field] = this.fields[field] || this.workForm.value[field];
    })
    if (this.select){
      this.modalCtrl.dismiss(this.workForm.value);
    }
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

  filterTabs(fieldsList) {
    let result = [];
    fieldsList.forEach(field => {
      if (!this.calculate(field.invisible) && field.type == 'tab') {
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
      section: new FormControl(null),
      _id: new FormControl(''),
    });

    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    let self = this;
    let defaultTab = '';
      if (this._id) {
        this.workService.getWork(this._id).then((data) => {
          data.fields.forEach(field => {
            if (field.type == 'tab'){
              if(! defaultTab) {
                defaultTab = field.name;
              }
            }
            this.workForm.addControl(
              field.name, new FormControl(data[field.name])
            );
          })
          this.workForm.patchValue(data);
          if (Object.keys(this.workForm.value.activity).length === 0
          && !this.activity) {
            this.selectActivity();
          } else if (data['activity']) {
            this.setActivity(data['activity'])
          }
          this.recomputeFields();
          this.loading.dismiss();


        });
      }
      else if (this.data){
        this.data.fields.forEach(field => {
          this.workForm.addControl(
            field.name, new FormControl(this.data[field.name])
          );
        })
        this.workForm.patchValue(this.data);
        if (Object.keys(this.workForm.value.activity).length === 0
        && !this.activity) {
          this.selectActivity();
        }
        this.recomputeFields();
        this.loading.dismiss();
      }
      else {
        this.loading.dismiss();
        if (Object.keys(this.workForm.value.activity).length === 0
        && !self.activity) {
          this.selectActivity();
        } else {
          this.setActivity(this.activity);
        }
      }
  }

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
    let data_fields = data.fields && data.fields.sort(function(a, b) {
      return self.formatService.compareField(a, b, 'sequence');
    }) || [];

    let defaultTab = null;
    data_fields.forEach(field => {
      if (field.type == "boolean") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||false));
      } else if (field.type == "float") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||0));
      }
      else if (field.type == "string") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||""));
      }
      else if (field.type == "progress") {
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||0));
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
      } else if (field.type == 'tab'){
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||[]));
        if(! defaultTab) {
          defaultTab = field.name;
        }
      }
    });
    this.workForm.patchValue({
      activity: data,
      fields: data.fields,
    });
    setTimeout(function(){
        self.workForm.patchValue({
          'section': defaultTab,
        });
    }, 200);
    this.workForm.markAsDirty();
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
    return total;
  }

  selectM2O(fielD, model, context="{}") {
    context = JSON.parse(context || "{}");
    this.events.subscribe('select-' + model, (data) => {
      let field = {};
      field[fielD.name] = data;
      this.workForm.patchValue(field);
      this.recomputeFields();
      this.events.unsubscribe('select-' + model);
      this.workForm.markAsDirty();
      let self = this;
      let d = {}
      if(fielD.onchange){
        fielD.onchange.split(';').forEach(item=>{
          let fieldName = item.split('=')[0]
          let fieldData = item.split('=')[1]
          d[fieldName] = data[fieldData];
        })
        this.workForm.patchValue(d);
      }
      this.goNextStep();
    })
    switch (model) {
      case 'contact':
        this.showModal(ContactListPage, context)
        break;
      case 'product':
        this.showModal(ProductListPage, context)
        break;
      case 'area':
        this.showModal(AreasPage, context)
        break;
      case 'machine':
        this.showModal(MachinesPage, context)
        break;
      case 'crop':
        this.showModal(CropsPage, context)
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
    // context["open"] = true;
    context["select"] = true;
    let profileModal = await this.modalCtrl.create({
      component: WorkPage,
      componentProps: context
    });
    profileModal.onDidDismiss().then(data => {
      if (data.data) {
        field.push(data.data);
        this.workForm.markAsDirty();
        this.recomputeFields();
      }
      this.workForm.patchValue({
        'section': field_name,
      });
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
    let context = {
      data: this.workForm.value[field_name][item],
      list: true,
      go: true,
      activity: activity,
      select: true,
    }

    let profileModal = await this.modalCtrl.create({
      component:WorkPage,
      componentProps: context
    });
    profileModal.onDidDismiss().then(data => {
      if (data.data) {
        field[item] = data.data;
        this.workForm.markAsDirty();
      }
      this.recomputeFields();
      this.workForm.patchValue({
        'section': field_name,
      });
    });
    profileModal.present();
  }

  removeFieldItem(field_name, item){
    this.workForm.value[field_name].splice(item, 1);
    this.workForm.markAsDirty();
  }

  goNextStep() {
    let done = true;
    let defaultTab = null;
    if (this.go && this.list) {
      this.dismissData()
    }
    for (let field of this.workForm.value.fields) {
      if (field.type == 'float'
      || field.type == 'integer'
      || field.type == 'string'){
        console.log("field.name", field.name);
        console.log("pageFields", this.elementRef.nativeElement);
        // this.pageFields['el'].children[0].setFocus();
        // let element = this.pageFields;
        let element = this.elementRef.nativeElement.querySelector(
          '#teste'
        );
        console.log("element", element);
        // if (element.value=="0" || element.value==""){
        //   // this.renderer.invokeElementMethod(element, 'focus', []);
        //   element.select();
        //   done = false;
        //   break;
        // }
        if (this.list && ! this.go){
          done = false;
          this.go = true;
          break;
        }
      }
      else
      if (field.type == 'date'){

      }
      else if (field.type == 'boolean'){

      }
      else if (field.type == 'many2one'){
        if (Object.keys(this.workForm.value[field.name]).length === 0){
          this.selectM2O(field, field.model, field.context);
          done = false;
          break;
        }
      }
      else if (field.type == 'list' || field.type == 'tab'){
        if (this.workForm.value[field.name].length === 0){
          // this.addFieldItem(field.name)
          // this.workForm.patchValue({
          //   "section": field.name,
          // });
          if (! defaultTab){
            defaultTab = field.name;
          }
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
    this.workForm.patchValue({
      'section': defaultTab,
    });
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
