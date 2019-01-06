import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController,  ModalController, LoadingController, AlertController, Events } from '@ionic/angular';
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
  @ViewChild('description') descriptionField;
  @ViewChild('distance') distanceField;
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
      //this.loading = //this.loadingCtrl.create();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      // this._id = this._id');
      // this.today = new Date().toISOString();
    }

    ngOnInit() {
      this.travelForm = this.formBuilder.group({
        description: new FormControl(this.distance||null),
        distance: new FormControl(this.distance||null),
        start_time: new FormControl(this.start_time||''),
        start_km: new FormControl(this.start_km||''),
        end_time: new FormControl(this.end_time||''),
        end_km: new FormControl(this.end_km||''),
        // date: new FormControl(this.date||new Date().toISOString()),
        time: new FormControl(this.time||''),
        vehicle: new FormControl(this.vehicle||''),
        note: new FormControl(this.note||''),
      });
    // }
    //
    // ionViewDidLoad(){
      setTimeout(() => {
        this.descriptionField.setFocus();
      }, 200);
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
        let profileModal = await this.modalCtrl.create({
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
      this.modalCtrl.dismiss(this.travelForm.value);
      if (this.travelForm.value.vehicle){
        this.travelForm.value.vehicle['meter'] = this.travelForm.value.end_km;
        this.pouchdbService.updateDoc(this.travelForm.value.vehicle);
      }
    }


    async goNextStep() {
      // if (this.travelForm.value.state == 'QUOTATION'){
      //   console.log("set Focus");
      //   if (this.travelForm.value.client_request == ''){
      //     this.clientRequest.setFocus();
      //   }
      if (this.travelForm.value.description==null){
        this.descriptionField.setFocus();
        return;
      }
      else if (this.travelForm.value.distance==null){
        this.distanceField.setFocus();
        return;
      }
    }


    showNextButton(){
      // console.log("stock",this.travelForm.value.stock);
      if (this.travelForm.value.description==null){
        return true;
      }
      else if (this.travelForm.value.distance==null){
        return true;
      }
      // else if (this.travelForm.value.cost==null){
      //   return true;
      // }
      // else if (this.travelForm.value.type=='product'&&this.travelForm.value.stock==null){
      //   return true;
      // }
      else {
        return false;
      }
    }
    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
        if(this.travelForm.dirty) {
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
        this.travelForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/sale-list');
      }
    }

}
