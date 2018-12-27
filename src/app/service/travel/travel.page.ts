import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events } from '@ionic/angular';
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
  @ViewChild('distance') distance;
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
      this._id = this.route.snapshot.paramMap.get('_id');
      // this.today = new Date().toISOString();
    }

    ngOnInit() {
      this.travelForm = this.formBuilder.group({
        distance: new FormControl(this.route.snapshot.paramMap.get('distance')||''),
        start_time: new FormControl(this.route.snapshot.paramMap.get('start_time')||''),
        start_km: new FormControl(this.route.snapshot.paramMap.get('start_km')||''),
        end_time: new FormControl(this.route.snapshot.paramMap.get('end_time')||''),
        end_km: new FormControl(this.route.snapshot.paramMap.get('end_km')||''),
        // date: new FormControl(this.route.snapshot.paramMap.get('date||new Date().toISOString()),
        time: new FormControl(this.route.snapshot.paramMap.get('time')||''),
        vehicle: new FormControl(this.route.snapshot.paramMap.get('vehicle')||''),
        note: new FormControl(this.route.snapshot.paramMap.get('note')||''),
      });
    // }
    //
    // ionViewDidLoad(){
      setTimeout(() => {
        this.distance.setFocus();
      }, 700);
    }

    selectVehicle() {
      return new Promise(async resolve => {
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
        let profileModal = await this.modal.create({
          component: ProductListPage,
          componentProps: {"select": true, "filter": "vehicle"}
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
