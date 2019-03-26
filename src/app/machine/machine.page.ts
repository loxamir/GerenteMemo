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
import { MachineService } from './machine.service';
import { WorkPage } from '../work/work.page';
// import { MachineMoveService } from './move/machine-move.service';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
// import { AccountsPage } from './move/account/list/accounts';

@Component({
  selector: 'app-machine',
  templateUrl: './machine.page.html',
  styleUrls: ['./machine.page.scss'],
})
export class MachinePage implements OnInit {

  machineForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  select;
  create;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
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
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.create = this.route.snapshot.paramMap.get('create');
    this.events.subscribe('changed-machine-move', (change)=>{
      this.machineService.handleChange(this.machineForm.value.moves, change);
    })
  }

  async ngOnInit() {
    this.machineForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      balance: new FormControl(0),
      hourCost: new FormControl(0),
      horimeter: new FormControl(0),
      type: new FormControl('tractor'),
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
      this.machineService.getMachine(this._id).then((data) => {
        this.machineForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.machineService.updateMachine(this.machineForm.value);
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-machine', this.machineForm.value);
        this.navCtrl.navigateBack('/agro-tabs/machine-list');
      // });
    } else {
      this.machineService.createMachine(this.machineForm.value).then(doc => {
        //console.log("docss", doc);
        this.machineForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-machine', this.machineForm.value);
          this.navCtrl.navigateBack('/agro-tabs/machine-list');
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
    this.events.subscribe('open-machine-move', (data) => {
      item.amount = data.amount;
      item.date = data.date;
      this.events.unsubscribe('open-machine-move');
    });
    let profileModal = await this.modalCtrl.create({
      component:WorkPage,
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
        "machine": this.machineForm.value,
      }
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

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.machineForm.dirty) {
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
      this.machineForm.markAsPristine();
      this.navCtrl.navigateBack('/agro-tabs/machine-list');
    }
  }

}