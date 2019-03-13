import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController,  ModalController, LoadingController,
   AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { CropService } from './crop.service';
import { WorkPage } from '../work/work.page';
// import { CropMoveService } from './move/crop-move.service';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
// import { AccountsPage } from './move/account/list/accounts';

@Component({
  selector: 'app-crop',
  templateUrl: './crop.page.html',
  styleUrls: ['./crop.page.scss'],
})
export class CropPage implements OnInit {

  cropForm: FormGroup;
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
    public cropService: CropService,
    // public cropMoveService: CropMoveService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public events: Events,
    public formatService: FormatService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');
    this.events.subscribe('changed-crop-move', (change)=>{
      this.cropService.handleChange(this.cropForm.value.moves, change);
    })
  }

  ngOnInit() {
    this.cropForm = this.formBuilder.group({
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
    //this.loading.present();
    if (this._id){
      this.cropService.getCrop(this._id).then((data) => {
        this.cropForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.cropService.updateCrop(this.cropForm.value);
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-crop', this.cropForm.value);
      // });
    } else {
      this.cropService.createCrop(this.cropForm.value).then(doc => {
        //console.log("docss", doc);
        this.cropForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-crop', this.cropForm.value);
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
    this.events.subscribe('open-crop-move', (data) => {
      item.amount = data.amount;
      item.date = data.date;
      this.events.unsubscribe('open-crop-move');
    });
    let profileModal = await this.modal.create({
      component:WorkPage,
      componentProps: {
        "_id": item._id,
      }});
    profileModal.present();
  }

  async addActivity(){
    let profileModal = await this.modal.create({
      component: WorkPage,
      componentProps: {
        "roca": this.cropForm.value,
      }
    });
    profileModal.present();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.cropService.getCrop(this._id).then((data) => {
        this.cropForm.patchValue(data);
        //this.loading.dismiss();
      });
      refresher.target.complete();
    }, 200);
  }

  doRefreshList(){
    this.cropService.getCrop(this._id).then((data) => {
      this.cropForm.patchValue(data);
      //this.loading.dismiss();
    });
  }

  onSubmit(values){
    //console.log(values);
  }

}
