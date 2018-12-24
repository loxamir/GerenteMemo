import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController,
   AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { MachineService } from './machine.service';
import { WorkPage } from '../work/work';
// import { MachineMoveService } from './move/machine-move.service';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
// import { AccountsPage } from './move/account/list/accounts';

@Component({
  selector: 'machine-page',
  templateUrl: 'machine.html'
})
export class MachinePage {

  machineForm: FormGroup;
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
    public machineService: MachineService,
    // public machineMoveService: MachineMoveService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public events: Events,
    public formatService: FormatService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    this.events.subscribe('changed-machine-move', (change)=>{
      this.machineService.handleChange(this.machineForm.value.moves, change);
    })
  }

  ionViewWillLoad() {
    this.machineForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      balance: new FormControl(0),
      currency: new FormControl({}),
      currency_name: new FormControl(''),
      moves: new FormControl([]),
      checks: new FormControl([]),
      type: new FormControl('liquidity'),
      sequence: new FormControl(1),
      note: new FormControl(''),
      code: new FormControl(''),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.machineService.getMachine(this._id).then((data) => {
        this.machineForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.machineService.updateMachine(this.machineForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-machine', this.machineForm.value);
      });
    } else {
      this.machineService.createMachine(this.machineForm.value).then(doc => {
        //console.log("docss", doc);
        this.machineForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-machine', this.machineForm.value);
        });
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


  openItem(item) {
    this.events.subscribe('open-machine-move', (data) => {
      item.amount = data.amount;
      item.date = data.date;
      this.events.unsubscribe('open-machine-move');
    });
    this.navCtrl.navigateForward(WorkPage, {
      "_id": item._id,
    });
  }

  addActivity(){
    let profileModal = this.modal.create(WorkPage, {
      "machine": this.machineForm.value,
    });
    profileModal.present();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.machineService.getMachine(this._id).then((data) => {
        this.machineForm.patchValue(data);
        //this.loading.dismiss();
      });
      refresher.target.complete();
    }, 200);
  }

  doRefreshList(){
    this.machineService.getMachine(this._id).then((data) => {
      this.machineForm.patchValue(data);
      //this.loading.dismiss();
    });
  }

  onSubmit(values){
    //console.log(values);
  }

}
