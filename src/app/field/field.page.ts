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
  selector: 'app-field',
  templateUrl: './field.page.html',
  styleUrls: ['./field.page.scss'],
})
export class FieldPage implements OnInit {
  fieldForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;
  name;
  type;
  label;
  model;
  formula;
  script;
  invisible;
  readonly;
  note;
  attributes;
  class;
  sequence;
  activity;
  activity_id;
  context;
  select;

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
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.name = this.route.snapshot.paramMap.get('name');
    this.type = this.route.snapshot.paramMap.get('type');
    this.label = this.route.snapshot.paramMap.get('label');
    this.model = this.route.snapshot.paramMap.get('model');
    this.formula = this.route.snapshot.paramMap.get('formula');
    this.script = this.route.snapshot.paramMap.get('script');
    this.invisible = this.route.snapshot.paramMap.get('invisible');
    this.readonly = this.route.snapshot.paramMap.get('readonly');
    this.note = this.route.snapshot.paramMap.get('note');
    this.attributes = this.route.snapshot.paramMap.get('attributes');
    this.class = this.route.snapshot.paramMap.get('class');
    this.sequence = this.route.snapshot.paramMap.get('sequence');
    this.activity = this.route.snapshot.paramMap.get('activity');
    this.activity_id = this.route.snapshot.paramMap.get('activity_id');
    this.context = this.route.snapshot.paramMap.get('context');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ngOnInit() {
    this.fieldForm = this.formBuilder.group({
      name: new FormControl(this.name||''),
      type: new FormControl(this.type||'float'),
      label: new FormControl(this.label||''),
      model: new FormControl(this.model||''),
      // filter: new FormControl(this.filter||''),
      formula: new FormControl(this.formula||''),
      script: new FormControl(this.script||''),
      invisible: new FormControl(this.invisible||''),
      readonly: new FormControl(this.readonly||''),
      note: new FormControl(this.note||''),
      attributes: new FormControl(this.attributes||[]),
      class: new FormControl(this.class||'half-width'),
      sequence: new FormControl(this.sequence||0),
      activity: new FormControl(this.activity||{}),
      activity_id: new FormControl(this.activity_id||''),
      context: new FormControl(this.context||'{}'),
    });
  }

  buttonSave(){

    this.modalCtrl.dismiss(this.fieldForm.value);
  }

  selectActivity() {
    return new Promise(async resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-activity');
      this.events.subscribe('select-activity', (data) => {
        this.fieldForm.patchValue({
          activity: data,
          activity_id: data._id,
          // fields: data.fields,
        });
        this.fieldForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-activity');
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ActivitysPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });

  }

  async addFieldItem(){
    let self = this;
    let prompt = await self.alertCtrl.create({
      // title: 'Cantidad del Producto',
      message: 'Cual es el Cantidad de este producto?',
      inputs: [
        {
          // type: 'string',
          name: 'name',
          value: ""
        },
        {
          // type: 'string',
          name: 'label',
          value: ""
        },
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Confirmar',
          handler: data => {
            self.fieldForm.value.attributes.unshift({
              'name': data.name,
              'label': data.label,
            })
            this.fieldForm.markAsDirty();
          }
        }
      ]
    });
    prompt.present();
  }

  async editFieldItem(item, index){
    let self = this;
    let prompt = await self.alertCtrl.create({
      // title: 'Cantidad del Producto',
      message: 'Cual es el Cantidad de este producto?',
      inputs: [
        {
          // type: 'string',
          name: 'name',
          value: item.name,
        },
        {
          // type: 'string',
          name: 'label',
          value: item.label
        },
      ],
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          handler: data => {
            self.fieldForm.value.attributes[index].name = data.name;
            self.fieldForm.value.attributes[index].label = data.label;
            // self.fieldForm.value.attributes.unshift({
            //   'name': data.name,
            //   'label': data.label,
            // })
            this.fieldForm.markAsDirty();
          }
        }
      ]
    });
    prompt.present();
  }

  removeFieldItem(item){
    this.fieldForm.value.attributes.splice(item, 1);
    this.fieldForm.markAsDirty();
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.fieldForm.dirty) {
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
      this.fieldForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/sale-list');
    }
  }
}
