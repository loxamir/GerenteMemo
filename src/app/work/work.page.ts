import { Component, ViewChild, ElementRef, OnInit, Input, ViewChildren } from '@angular/core';
import { NavController,  LoadingController, AlertController,
  Events, ToastController, ModalController,
} from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { WorkService } from './work.service';
import { ProductService } from '../product/product.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
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
import { WarehouseListPage } from '../warehouse-list/warehouse-list.page';
import { FutureContractListPage } from '../future-contract-list/future-contract-list.page';

@Component({
  selector: 'app-work',
  templateUrl: './work.page.html',
  styleUrls: ['./work.page.scss'],
})
export class WorkPage implements OnInit {
  @ViewChild('teste', { static: false }) pageFields: any[];
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
  note;
  @Input() go = false;
  @Input() area: any;
  @Input() machine: any;
  config;
  deleteList = [];
  currency_precision = 2;
  editDate = false;
  showPlan = false;
  tmpData = {};
  state = 'DRAFT';

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
    this.today = new Date();
    this._id = this.route.snapshot.paramMap.get('_id');
    this.activity = this.route.snapshot.paramMap.get('activity');
    this.area = eval(this.route.snapshot.paramMap.get('area'));
    this.machine = eval(this.route.snapshot.paramMap.get('machine'));
    this.select = this.route.snapshot.paramMap.get('select');
    this.note = this.route.snapshot.paramMap.get('note');
    this.state = this.route.snapshot.paramMap.get('state') || this.state;
  }

  dismissData(){
    Object.keys(this.fields).forEach((field: any)=>{
      this.workForm.value[field] = this.fields[field] || this.workForm.value[field];
    })
    if (this.select){
      this.modalCtrl.dismiss(this.workForm.value);
    }
  }

  showDate(){
    this.editDate = !this.editDate;
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
      let form = this.workForm.value;
      // console.log("eval", formula);
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
      date: new FormControl(this.today.toISOString()),
      dateEnd: new FormControl(this.today.toISOString()),
      note: new FormControl(),
      state: new FormControl(this.state),
      fields: new FormControl([]),
      summary: new FormControl(""),
      section: new FormControl(null),
      doc_id: new FormControl(''),
      plan: new FormControl({}),
      scheduled: new FormControl(false),
      _id: new FormControl(''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);

    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.config = await this.configService.getConfig();
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
        this.data['state'] = this.state;
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

  cleanSection(){
    this.workForm.controls.section.markAsPristine();
  }

  async buttonSave() {
    let dict = {}
    // }
    this.workForm.value.fields.forEach(field=>{
      if (field.type == 'formula'){
        dict[field.name] = this.fields[field.name]
      }
    })
    this.workForm.patchValue(dict);
    if (this.select && this.list) {
      this.dismissData();
    } else {
      await this.preSave();
      this.setSummary();
      this.deleteRemoved();
      if (this._id) {
        this.workService.updateWork(this.workForm.value);
        this.events.publish('open-work', this.workForm.value);
        this.workForm.markAsPristine();
        // this.navCtrl.navigateBack('/works');
        this.modalCtrl.dismiss();
        // this.postSave();
      } else {
        this.workService.createWork(this.workForm.value).then(doc => {
          this.workForm.patchValue({
            _id: doc['doc'].id,
            code: doc['work'].code,
          });
          this._id = doc['doc'].id;
          this.events.publish('create-work', this.workForm.value);
          this.workForm.markAsPristine();
          // this.navCtrl.navigateBack('/works');
          this.modalCtrl.dismiss();
          // this.postSave();
        });
      }
    }
  }

  async justSave() {
    let dict = {}
    this.workForm.value.fields.forEach(field=>{
      if (field.type == 'formula'){
        dict[field.name] = this.fields[field.name]
      }
    })
    this.workForm.patchValue(dict);
    // if (this.select && this.list) {
    //   this.dismissData();
    // } else {
      await this.preSave();
      this.setSummary();
      this.deleteRemoved();
      if (this._id) {
        this.workService.updateWork(this.workForm.value);
        this.events.publish('open-work', this.workForm.value);
        this.workForm.markAsPristine();
        // this.navCtrl.navigateBack('/works');
        // this.modalCtrl.dismiss();
        // this.postSave();
      } else {
        this.workService.createWork(this.workForm.value).then(doc => {
          this.workForm.patchValue({
            _id: doc['doc'].id,
            code: doc['work'].code,
          });
          this._id = doc['doc'].id;
          this.events.publish('create-work', this.workForm.value);
          this.workForm.markAsPristine();
          // this.navCtrl.navigateBack('/works');
          // this.modalCtrl.dismiss();
          // this.postSave();
        });
      }
    // }
  }

  setSummary(){
      let summary = this.workForm.value.summary || "";
      // console.log("summary", summary);
      if (summary){
        let list = summary.split("${").splice(1);
        list.forEach(variable=>{
            variable = variable.split("}")[0];
            // console.log("variable", variable);
            summary = summary.replace("${"+variable+"}", this.workForm.value[variable]);
        })
      }
      this.workForm.patchValue({
        summary: summary
      })
      // console.log("summary2", summary);
      // return summary;
  }

  preSave() {
    return new Promise(async (resolve, reject)=>{
      let form = this.workForm.value;
      let result = await eval(this.activity.saveScript);
      // console.log("resultads", result)
      resolve(result);
    })
  }

  deleteRemoved(){
    this.deleteList.forEach(item=>{
      this.pouchdbService.deleteDoc(item);
    })
  }

  // postSave() {
  //   let result = eval(this.activity.saveScript);
  //   console.log("resultads", result)
  //   return result;
  // }

  async updateDoc(doc_id, changes){
    return new Promise(async (resolve, reject)=>{
      let doc = await this.pouchdbService.getDoc(doc_id);
      // console.log("doc1", doc);
      changes.forEach((data: any)=>{
        Object.keys(data).forEach((d: any, key)=>{
          doc[d] = data[d];
        })
      })
      // console.log("doc2", doc);
      await this.pouchdbService.updateDoc(doc);
      resolve(doc);
    })
  }

  async createDoc(data){
    return new Promise(async (resolve, reject)=>{
    let doc = await this.pouchdbService.createDoc(data);
    // console.log("created doc", doc);
    resolve(doc);
  })
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
          "filter": "showLess"
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
        this.workForm.addControl(field.name, new FormControl(this.route.snapshot.paramMap.get(field.name)||this.today.toISOString()));
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
    if (this.area){
      this.workForm.patchValue({
        area: this.area,
        crop: this.area.crop,
        // surface: this.area.surface, //Enabled to complete the surface field
      });
    }
    if (this.machine){
      if (this.activity._id == 'activity.fuel'){
        this.workForm.patchValue({
          machine: this.machine,
          product: this.machine.fuel,
        });
      } else {
        this.workForm.patchValue({
          machine: this.machine,
        });
      }
    }
    this.workForm.patchValue({
      activity: data,
      fields: data.fields,
      summary: data.summary
    });
    this.activity = data;
    setTimeout(function(){
        self.workForm.patchValue({
          'section': defaultTab,
        });
    }, 200);
    // this.workForm.markAsDirty();
    this.events.unsubscribe('select-activity');
    // console.log("note", this.note);
    if (this.note){
      this.workForm.value.note = this.note;
      this.buttonSave();
    } else {
      setTimeout(function(){
        self.goNextStep();
      }, 200);
    }
  }

  buttonPress(field) {
    let form = this.workForm.value;
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

  sumListFieldMulti(field_name, field1='quantity', field2='cost'){
    let total = 0;
    if (this.workForm.value[field_name]){
      let value = this.workForm.value[field_name].forEach((item: any)=>{
        total += parseFloat(item[field1])*parseFloat(item[field2])
      })
    }
    return total;
  }

  selectM2O(fielD, model, context="{}") {
    if (this.workForm.value.state=='DRAFT' || this.workForm.value.state=='STARTED'){
      context = JSON.parse(context || "{}");
      this.events.subscribe('select-' + model, async (data) => {
        let field = {};
        field[fielD.name] = data;
        this.workForm.patchValue(field);
        this.recomputeFields();
        this.events.unsubscribe('select-' + model);
        this.workForm.controls[fielD.name].markAsDirty();
        let self = this;
        let d = {}
        if(fielD.onchange){
          await this.formatService.asyncForEach(fielD.onchange.split(';'), async item=>{
            // .forEach(async item=>{
            let fieldName = item.split('=')[0];
            let fieldData = item.split('=')[1];
            if (fieldData){
              if (isNaN(fieldData)){
                if (fieldData[0] == '#'){
                  let split = fieldData.split('#')
                  let ddoc = data[split[1]];
                  let fieldDoc:any = await this.pouchdbService.getDoc(ddoc);
                  d[fieldName] = fieldDoc;
                } else {
                  d[fieldName] = data[fieldData];
                }
              } else {
                d[fieldName] = fieldData;
              }
            }
          })
          this.workForm.patchValue(d);
        }
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
        case 'warehouse':
        this.showModal(WarehouseListPage, context)
        break;
        case 'future-contract':
        this.showModal(FutureContractListPage, context)
        break;
      }
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
        // this.workForm.markAsDirty();
        this.workForm.controls[field_name].markAsDirty();
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
      state: this.workForm.value.state,
      select: true,
    }

    let profileModal = await this.modalCtrl.create({
      component:WorkPage,
      componentProps: context
    });
    profileModal.onDidDismiss().then(data => {
      if (data.data) {
        field[item] = data.data;
        // this.workForm.markAsDirty();
        this.workForm.controls[field_name].markAsDirty();
      }
      this.recomputeFields();
      this.workForm.patchValue({
        'section': field_name,
      });
    });
    profileModal.present();
  }

  async removeFieldItem(field_name, item){
    let doc = this.workForm.value[field_name][item];
    this.workForm.value[field_name].splice(item, 1);
    if (doc.doc_id){
      let remove = await this.pouchdbService.getDoc(doc.doc_id);
      this.deleteList.push(remove);
    }
    this.workForm.markAsDirty();
  }

  goNextStep() {
    let done = true;
    let defaultTab = null;
    if (this.go && this.list) {
      this.dismissData();
    }
    for (let field of this.workForm.value.fields) {
      if (field.type == 'float'
      || field.type == 'integer'
      || field.type == 'string'){
        let element = this.elementRef.nativeElement.querySelector(
          '#'+field.name+' > input'
        );
        if (element && (element.value=="0" || element.value=="")){
          element.focus();
          element.select();
          done = false;
          break;
        }
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
          if (! defaultTab){
            defaultTab = field.name;
          }
          done = false;
          break;
      }
      // else if (field.type == 'button'){
      //   this.buttonPress(field);
      //   done = false;
      //   break;
      // }
    }
    // this.workForm.patchValue({
    //   'section': defaultTab,
    // });
    if (done && this.list) {
      this.dismissData()
    }
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
    if(this.workForm.dirty) {
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
    if (this.select){
      this.modalCtrl.dismiss();
    } else {
      this.workForm.markAsPristine();
      this.navCtrl.navigateBack('/agro-tabs/work-list');
    }
  }

  async stockMoveInCreate(name, quantity, product, warehouse=undefined, contract_id=undefined){
    /*
    Just create an iconming stock move
    */
    if (!warehouse){
      warehouse = {
        _id: this.config.warehouse_id,
        name: this.config.warehouse_name,
      }
    }
    return new Promise(async (resolve, reject)=>{
      let move:any = await this.createDoc({
        'name': name,
        'quantity': parseFloat(quantity),
        'origin_id': this.workForm.value._id,
        'contract_id': contract_id,
        'contact_id': 'contact.myCompany',
        'contact_name': this.config.name,
        'product_id': product._id,
        'product_name': product.name,
        'docType': "stock-move",
        'date': new Date(),
        'cost': parseFloat(product.cost)*parseFloat(quantity),
        'warehouseFrom_id': 'warehouse.production',
        'warehouseFrom_name': "Producción",
        'warehouseTo_id': warehouse._id,
        'warehouseTo_name': warehouse.name,
      });
      // return move
      resolve(move);
    });
  }

  async stockMoveCreate(name, quantity, product){
    /*
    Just create the stock move
    */
    return new Promise(async (resolve, reject)=>{
      let move:any = await this.createDoc({
        'name': name,
        'quantity': parseFloat(quantity),
        'origin_id': this.workForm.value._id,
        'contact_id': 'contact.myCompany',
        'contact_name': this.config.name,
        'product_id': product._id,
        'product_name': product.name,
        'docType': "stock-move",
        'date': new Date(),
        // 'cost': product.cost,
        'cost': parseFloat(product.cost)*parseFloat(quantity),
        'warehouseFrom_id': this.config.warehouse_id,
        'warehouseFrom_name': this.config.warehouse_name,
        'warehouseTo_id': 'warehouse.production',
        'warehouseTo_name': "Producción",
      });
      // return move
      resolve(move);
    });
  }

  async stockMove(name, qty_field="quantity", product_field="product"){
    /*
    Create a stock move for an activity
    */
    let item = this.workForm.value;
    if (this.workForm.controls[qty_field].dirty || this.workForm.controls[product_field].dirty){
      if(item.doc_id){
        let update = await this.updateDoc(item.doc_id, [{
          'quantity': parseFloat(item[qty_field]),
        }]);
      } else {
        let move:any = await this.stockMoveCreate(name, item[qty_field], item[product_field])
        item.doc_id = move.id;
        this.workForm.patchValue({
          doc_id: move.id
        })
      }
    }
  }

  stockMoveCreateList(list_field, name, qty_field="quantity", product_field="product"){
    /*
    Create a list of stock moves based on a list
    */
    return new Promise(async (resolve, reject)=>{
      // console.log("fieldsd ddd", this.workForm.controls[list_field].dirty);
      if (this.workForm.controls[list_field].dirty){
        this.formatService.asyncForEach(this.workForm.value[list_field], async (item)=>{
          if(item.doc_id){
            let update = await this.updateDoc(item.doc_id, [{
              'quantity': parseFloat(item[qty_field]),
            }]);
          } else {
            let move:any = await this.stockMoveCreate(name, item[qty_field], item[product_field])
            item.doc_id = move.id;
          }
        }).then((data)=>{
          // console.log("data", data);
          resolve(true);
        })
      } else {
        resolve(false)
      }
    })
  }

  stockMoveCreateListFixedProduct(list_field, name, product, qty_field="quantity"){
    /*
    Create a list of stock moves based on a list with a fixed product
    */
    return new Promise(async (resolve, reject)=>{
      if (typeof product === 'string'){
        product = await this.pouchdbService.getDoc(product);
      }
      if (this.workForm.controls[list_field].dirty){
        let data:any = await this.formatService.asyncForEach(this.workForm.value[list_field], async (item)=>{
          let contract_id:any = undefined;
          if (item['contract'] && JSON.stringify(item['contract']) != '{}'){
            contract_id = item['contract']._id
          }
          if(item.doc_id){
            let warehouse:any = item['warehouse'];
            if (!item['warehouse'] || JSON.stringify(item['warehouse']) == '{}'){
              warehouse = {
                _id: this.config.warehouse_id,
                name: this.config.warehouse_name,
              }
            }
            let update = await this.updateDoc(item.doc_id, [{
              'quantity': parseFloat(item[qty_field]),
              'warehouseTo_id': warehouse._id,
              'warehouseTo_name': warehouse.name,
              'contract_id': contract_id
            }]);
          } else {
            let move:any = await this.stockMoveInCreate(name, item[qty_field], product, item['warehouse'], contract_id)
            item.doc_id = move.id;
            let contract = await this.pouchdbService.getDoc(contract_id);
            contract['delivered'] += parseFloat(item[qty_field]);
            await this.pouchdbService.updateDoc(contract)
          }
        })
        resolve(true);
      } else {
        resolve(false)
      }
    })
  }

  setStarted() {
    // this.workForm.value.state="STARTED";
    this.workForm.patchValue({
      state: "STARTED",
      date: this.today.toISOString(),
    })
    this.justSave();
  }

  setScheduled(){
    this.workForm.patchValue({
      state: "SCHEDULED",
      plan: this.workForm.value,
      scheduled: true,
    })
    this.buttonSave();
  }

  concludeWork() {
    // this.workForm.value.state="DONE";
    this.workForm.patchValue({
      state: "DONE",
      dateEnd: this.today.toISOString(),
    })
    this.buttonSave();
  }

  showPlanData(){
    // if (this.showPlan){
    //   this.showPlan = false;
    //   this.workForm.patchValue(this.tmpData);
    //   this.recomputeFields();
    // } else {
    //   this.showPlan = true;
    //   this.tmpData = this.workForm.value;
    //   delete this.workForm.value.plan.state;
    //   this.workForm.patchValue(this.workForm.value.plan);
    //   this.recomputeFields();
    // }
  }

  dateChanged(){
    if (this.workForm.value.date < this.workForm.value.dateEnd){
      this.workForm.patchValue({
        dateEnd: this.workForm.value.date,
      })
    }
  }

  async dateEndChanged(){
    if (this.workForm.value.dateEnd < this.workForm.value.date){
      let alertPopup = await this.alertCtrl.create({
        header: this.translate.instant('DATE_ERROR'),
        message: this.translate.instant('DATE_END_LOWER_THAN_START'),
        buttons: [
        {
          text: this.translate.instant('OK'),
          handler: () => {
            // this.workForm.patchValue({
            //   dateEnd: this.workForm.value.date,
            // })
          }
        }]
      });
      alertPopup.present();
    }
  }

}
