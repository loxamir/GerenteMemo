import { Component, ViewChild } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events, TextInput } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProductsPage } from '../../product/list/products';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'travel-page',
  templateUrl: 'travel.html'
})
export class ServiceTravelPage {
@ViewChild('distance') distance: TextInput;
  travelForm: FormGroup;
  loading: any;
  _id: string;
  changeDistance: boolean = false;
  changeEnd: boolean = false;
  languages: Array<LanguageModel>;
    today: any = new Date().toISOString();

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    // this.today = new Date().toISOString();
  }

  ionViewWillLoad() {
    this.travelForm = this.formBuilder.group({
      distance: new FormControl(this.navParams.data.distance||''),
      start_time: new FormControl(this.navParams.data.start_time||''),
      start_km: new FormControl(this.navParams.data.start_km||''),
      end_time: new FormControl(this.navParams.data.end_time||''),
      end_km: new FormControl(this.navParams.data.end_km||''),
      // date: new FormControl(this.navParams.data.date||new Date().toISOString()),
      time: new FormControl(this.navParams.data.time||''),
      vehicle: new FormControl(this.navParams.data.vehicle||''),
      note: new FormControl(this.navParams.data.note||''),
    });
  }

  ionViewDidLoad(){
    setTimeout(() => {
      this.distance.setFocus();
    }, 700);
  }

  selectVehicle() {
    return new Promise(resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        this.travelForm.patchValue({
          vehicle: data,
          start_km: data.meter,
          end_km: parseFloat(data.meter) + parseFloat(this.travelForm.value.distance),
        });
        // this.onChangeStartKm();
        this.travelForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-product');
        resolve(true);
      })
      let profileModal = this.modal.create(ProductsPage, {"select": true, "filter": "vehicle"});
      profileModal.present();
    });
  }
  onChangeStartKm() {
    this.changeEnd = true;
    let end_km = (parseFloat(this.travelForm.value.start_km) || 0) + (parseFloat(this.travelForm.value.distance) || 0);
    this.travelForm.patchValue({
      start_time: new Date().toISOString(),
      end_km: end_km,
    });
  }
  onChangeEndKm() {
    if (!this.changeDistance){
      let distance = (parseFloat(this.travelForm.value.end_km) || 0) - (parseFloat(this.travelForm.value.start_km) || 0);
      this.changeEnd = true;
      if (distance < 0){
        distance = 0;
      }
      this.travelForm.patchValue({
        end_time: new Date().toISOString(),
        distance: distance,
      });
    } else {
      this.changeDistance = false;
    }
  }
  onChangeDistance() {
    if (!this.changeEnd){
      this.changeDistance = true;
      let end_km = (parseFloat(this.travelForm.value.start_km) || 0) + (parseFloat(this.travelForm.value.distance) || 0);
      // this.travelForm.value.end_km = end_km;
      this.travelForm.patchValue({
        end_km: end_km,
      });
    } else {
      this.changeEnd = false;
    }
  }
  buttonSave(){
    // this.viewCtrl.dismiss(this.travelForm.value);
    if (this.travelForm.value.vehicle){
      this.travelForm.value.vehicle['meter'] = this.travelForm.value.end_km;
      this.pouchdbService.updateDoc(this.travelForm.value.vehicle);
    }
  }
}
