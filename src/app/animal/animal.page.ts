import { Component, OnInit } from '@angular/core';
import { NavController,  ModalController, LoadingController,
   AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { AnimalService } from './animal.service';
import { WorkPage } from '../work/work.page';
// import { AnimalMoveService } from './move/animal-move.service';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
// import { AccountsPage } from './move/account/list/accounts';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-animal',
  templateUrl: './animal.page.html',
  styleUrls: ['./animal.page.scss'],
})
export class AnimalPage implements OnInit {

  animalForm: FormGroup;
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
    public animalService: AnimalService,
    // public animalMoveService: AnimalMoveService,
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
    this.events.subscribe('changed-animal-move', (change)=>{
      this.animalService.handleChange(this.animalForm.value.moves, change);
    })
  }

  ngOnInit() {
    this.animalForm = this.formBuilder.group({
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
    if (this._id){
      this.animalService.getAnimal(this._id).then((data) => {
        this.animalForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id){
      this.animalService.updateAnimal(this.animalForm.value);
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-animal', this.animalForm.value);
      // });
    } else {
      this.animalService.createAnimal(this.animalForm.value).then(doc => {
        //console.log("docss", doc);
        this.animalForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-animal', this.animalForm.value);
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


  openItem(item) {
    this.events.subscribe('open-animal-move', (data) => {
      item.amount = data.amount;
      item.date = data.date;
      this.events.unsubscribe('open-animal-move');
    });
    // this.navCtrl.navigateForward(WorkPage, {
    //   "_id": item._id,
    // });
  }

  async addActivity(){
    let profileModal = await this.modal.create({
      component: WorkPage,
      componentProps: {
        "roca": this.animalForm.value,
      }
    });
    profileModal.present();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.animalService.getAnimal(this._id).then((data) => {
        this.animalForm.patchValue(data);
        //this.loading.dismiss();
      });
      refresher.target.complete();
    }, 200);
  }

  doRefreshList(){
    this.animalService.getAnimal(this._id).then((data) => {
      this.animalForm.patchValue(data);
      //this.loading.dismiss();
    });
  }

  onSubmit(values){
    //console.log(values);
  }

}
