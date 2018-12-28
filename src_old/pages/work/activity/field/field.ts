import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController,
  Platform,  Events, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivitysPage } from '../../activity/list/activitys';

@Component({
  selector: 'field-page',
  templateUrl: 'field.html'
})
export class WorkFieldPage {
  fieldForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
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
    this._id = this.route.snapshot.paramMap.get(_id);
  }

  ionViewWillLoad() {
    this.fieldForm = this.formBuilder.group({
      name: new FormControl(this.navParams.data.name||''),
      type: new FormControl(this.navParams.data.type||'float'),
      label: new FormControl(this.navParams.data.label||''),
      model: new FormControl(this.navParams.data.model||''),
      // filter: new FormControl(this.navParams.data.filter||''),
      formula: new FormControl(this.navParams.data.formula||''),
      script: new FormControl(this.navParams.data.script||''),
      invisible: new FormControl(this.navParams.data.invisible||''),
      readonly: new FormControl(this.navParams.data.readonly||''),
      note: new FormControl(this.navParams.data.note||''),
      attributes: new FormControl(this.navParams.data.attributes||[]),
      class: new FormControl(this.navParams.data.class||'half-width'),
      sequence: new FormControl(this.navParams.data.sequence||0),
      activity: new FormControl(this.navParams.data.activity||{}),
      activity_id: new FormControl(this.navParams.data.activity_id||''),
      context: new FormControl(this.navParams.data.context||'{}'),
    });
  }

  buttonSave(){

    // this.viewCtrl.dismiss(this.fieldForm.value);
  }

  selectActivity() {
    return new Promise(resolve => {
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
      let profileModal = this.modal.create(ActivitysPage, {
        "select": true,
      });
      profileModal.present();
    });

  }

  addFieldItem(){
    let self = this;
    let prompt = self.alertCtrl.create({
      title: 'Cantidad del Producto',
      message: 'Cual es el Cantidad de este producto?',
      inputs: [
        {
          type: 'string',
          name: 'name',
          value: ""
        },
        {
          type: 'string',
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

  editFieldItem(item, index){
    let self = this;
    let prompt = self.alertCtrl.create({
      title: 'Cantidad del Producto',
      message: 'Cual es el Cantidad de este producto?',
      inputs: [
        {
          type: 'string',
          name: 'name',
          value: item.name,
        },
        {
          type: 'string',
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
}
