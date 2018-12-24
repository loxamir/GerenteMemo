import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController,
   AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { AreaService } from './area.service';
import { WorkPage } from '../work/work';
// import { AreaMoveService } from './move/area-move.service';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
// import { AccountsPage } from './move/account/list/accounts';

@Component({
  selector: 'area-page',
  templateUrl: 'area.html'
})
export class AreaPage {

  areaForm: FormGroup;
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
    public areaService: AreaService,
    // public areaMoveService: AreaMoveService,
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
    this.events.subscribe('changed-area-move', (change)=>{
      this.areaService.handleChange(this.areaForm.value.moves, change);
    })
  }

  ionViewWillLoad() {
    this.areaForm = this.formBuilder.group({
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
      this.areaService.getArea(this._id).then((data) => {
        this.areaForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.areaService.updateArea(this.areaForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-area', this.areaForm.value);
      });
    } else {
      this.areaService.createArea(this.areaForm.value).then(doc => {
        //console.log("docss", doc);
        this.areaForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-area', this.areaForm.value);
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
    this.events.subscribe('open-area-move', (data) => {
      item.amount = data.amount;
      item.date = data.date;
      this.events.unsubscribe('open-area-move');
    });
    this.navCtrl.navigateForward(WorkPage, {
      "_id": item._id,
    });
  }

  addActivity(){
    let profileModal = this.modal.create(WorkPage, {
      "area": this.areaForm.value,
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

}
