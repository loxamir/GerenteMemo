import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Events } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ProductListPage } from '../../product-list/product-list.page';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-travel',
  templateUrl: './travel.page.html',
  styleUrls: ['./travel.page.scss'],
})
export class ServiceTravelPage implements OnInit {
  @ViewChild('description', { static: true }) descriptionField;
  @ViewChild('distance', { static: true }) distanceField;
  travelForm: FormGroup;
  loading: any;
  _id: string;
  changeDistance: boolean = false;
  changeEnd: boolean = false;
  languages: Array<LanguageModel>;
  today: any = new Date().toISOString();
  select = true;
  @Input() description;
  @Input() distance;
  @Input() start_time;
  @Input() start_km;
  @Input() end_time;
  @Input() end_km;
  @Input() time;
  @Input() vehicle;
  @Input() note;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
  ) {
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
  }

  async ngOnInit() {
    this.travelForm = this.formBuilder.group({
      description: new FormControl(this.distance || null),
      distance: new FormControl(this.distance || null),
      start_time: new FormControl(this.start_time || ''),
      start_km: new FormControl(this.start_km || ''),
      end_time: new FormControl(this.end_time || ''),
      end_km: new FormControl(this.end_km || ''),
      time: new FormControl(this.time || ''),
      vehicle: new FormControl(this.vehicle || ''),
      note: new FormControl(this.note || ''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    setTimeout(() => {
      this.distanceField.setFocus();
    }, 200);
  }

  selectVehicle() {
    return new Promise(async resolve => {
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        this.travelForm.patchValue({
          vehicle: data,
          start_km: data.meter,
          end_km: parseFloat(data.meter) + parseFloat(this.travelForm.value.distance),
        });
        // this.onChangeStartKm();
        this.travelForm.markAsDirty();
        this.events.unsubscribe('select-product');
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ProductListPage,
        componentProps: { "select": true, "filter": "vehicle" }
      });
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
    if (!this.changeDistance) {
      let distance = (parseFloat(this.travelForm.value.end_km) || 0) - (parseFloat(this.travelForm.value.start_km) || 0);
      this.changeEnd = true;
      if (distance < 0) {
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
    if (!this.changeEnd) {
      this.changeDistance = true;
      let end_km = (parseFloat(this.travelForm.value.start_km) || 0) + (parseFloat(this.travelForm.value.distance) || 0);
      this.travelForm.patchValue({
        end_km: end_km,
      });
    } else {
      this.changeEnd = false;
    }
  }

  buttonSave() {
    this.modalCtrl.dismiss(this.travelForm.value);
    if (this.travelForm.value.vehicle) {
      this.travelForm.value.vehicle['meter'] = this.travelForm.value.end_km;
      this.pouchdbService.updateDoc(this.travelForm.value.vehicle);
    }
  }


  async goNextStep() {
    if (this.travelForm.value.distance == null) {
      this.distanceField.setFocus();
      return;
    }
    else if (this.travelForm.value.description == null) {
      this.descriptionField.setFocus();
      return;
    }
  }

  showNextButton() {
    if (this.travelForm.value.description == null) {
      return true;
    }
    else if (this.travelForm.value.distance == null) {
      return true;
    }
    else {
      return false;
    }
  }

  discard() {
    this.canDeactivate();
  }

  async canDeactivate() {
    if (this.travelForm.dirty) {
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
          handler: () => {
          }
        }]
      });
      alertPopup.present();
      return false;
    } else {
      this.exitPage();
    }
  }

  private exitPage() {
    if (this.select) {
      this.modalCtrl.dismiss();
    } else {
      this.travelForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/sale-list');
    }
  }

}
