import { Component, OnInit } from '@angular/core';
import { NavController,  ModalController, LoadingController,
  Platform,  Events, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivitysPage } from '../activitys/activitys.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {
  filterForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;
  select;
  context;
  model;
  type;
  value;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public platform: Platform,
    public route: ActivatedRoute,

    public formBuilder: FormBuilder,
    public events: Events,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create({});
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.select = this.route.snapshot.paramMap.get('select');
    this.context = this.route.snapshot.paramMap.get('context');
    this.model = this.route.snapshot.paramMap.get('model');
    this.type = this.route.snapshot.paramMap.get('type');
    this.value = this.route.snapshot.paramMap.get('value');
  }

  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      model: new FormControl(this.model||''),
      type: new FormControl(this.type||'equal'),
      value: new FormControl(this.type||'value'),
      context: new FormControl(this.context||'{}'),
    });
  }

  buttonSave(){

    this.modalCtrl.dismiss(this.filterForm.value);
  }

  // selectActivity() {
  //   return new Promise(async resolve => {
  //     // this.avoidAlertMessage = true;
  //     this.events.unsubscribe('select-activity');
  //     this.events.subscribe('select-activity', (data) => {
  //       this.filterForm.patchValue({
  //         activity: data,
  //         activity_id: data._id,
  //         // filters: data.filters,
  //       });
  //       this.filterForm.markAsDirty();
  //       // this.avoidAlertMessage = false;
  //       this.events.unsubscribe('select-activity');
  //       resolve(true);
  //     })
  //     let profileModal = await this.modalCtrl.create({
  //       component: ActivitysPage,
  //       componentProps: {
  //         "select": true,
  //       }
  //     });
  //     profileModal.present();
  //   });
  //
  // }
  //
  // async addFilterItem(){
  //   let self = this;
  //   let prompt = await self.alertCtrl.create({
  //     // title: 'Cantidad del Producto',
  //     message: 'Cual es el Cantidad de este producto?',
  //     inputs: [
  //       {
  //         // type: 'string',
  //         name: 'name',
  //         value: ""
  //       },
  //       {
  //         // type: 'string',
  //         name: 'label',
  //         value: ""
  //       },
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancel'
  //       },
  //       {
  //         text: 'Confirmar',
  //         handler: data => {
  //           self.filterForm.value.attributes.unshift({
  //             'name': data.name,
  //             'label': data.label,
  //           })
  //           this.filterForm.markAsDirty();
  //         }
  //       }
  //     ]
  //   });
  //   prompt.present();
  // }
  //
  // async editFilterItem(item, index){
  //   let self = this;
  //   let prompt = await self.alertCtrl.create({
  //     // title: 'Cantidad del Producto',
  //     message: 'Cual es el Cantidad de este producto?',
  //     inputs: [
  //       {
  //         // type: 'string',
  //         name: 'name',
  //         value: item.name,
  //       },
  //       {
  //         // type: 'string',
  //         name: 'label',
  //         value: item.label
  //       },
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancelar'
  //       },
  //       {
  //         text: 'Confirmar',
  //         handler: data => {
  //           self.filterForm.value.attributes[index].name = data.name;
  //           self.filterForm.value.attributes[index].label = data.label;
  //           // self.filterForm.value.attributes.unshift({
  //           //   'name': data.name,
  //           //   'label': data.label,
  //           // })
  //           this.filterForm.markAsDirty();
  //         }
  //       }
  //     ]
  //   });
  //   prompt.present();
  // }
  //
  // removeFilterItem(item){
  //   this.filterForm.value.attributes.splice(item, 1);
  //   this.filterForm.markAsDirty();
  // }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.filterForm.dirty) {
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
      this.filterForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/sale-list');
    }
  }
}
