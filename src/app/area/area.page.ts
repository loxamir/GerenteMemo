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
import { AreaService } from './area.service';
import { WorkPage } from '../work/work.page';
// import { AreaMoveService } from './move/area-move.service';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
import { CropsPage } from '../crops/crops.page';
import { ContactListPage } from '../contact-list/contact-list.page';

@Component({
  selector: 'app-area',
  templateUrl: './area.page.html',
  styleUrls: ['./area.page.scss'],
})
export class AreaPage implements OnInit {

  areaForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  create;
  select;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
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
    this._id = this.route.snapshot.paramMap.get('_id');
    this.create = this.route.snapshot.paramMap.get('create');
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-area-move', (change)=>{
      this.areaService.handleChange(this.areaForm.value.moves, change);
    })
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
      // note: new FormControl(''),
      code: new FormControl(''),
      _id: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    if (this._id){
      this.areaService.getArea(this._id).then((data) => {
        this.areaForm.patchValue(data);
        this.loading.dismiss();
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

  async addActivity(){
    let profileModal = await this.modalCtrl.create({
      component: WorkPage,
      componentProps: {
        "area": this.areaForm.value,
      }
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