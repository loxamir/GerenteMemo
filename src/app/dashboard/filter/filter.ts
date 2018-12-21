import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, ViewController, Events, TextInput } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";

@Component({
  selector: 'filter-page',
  templateUrl: 'filter.html'
})
export class DashboardFilterPage {
// @ViewChild('field') field: TextInput;
  filterForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  fields: any[] = [];
  field_value: any = {};

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
  }

  ionViewWillLoad() {
    this.filterForm = this.formBuilder.group({
      field: new FormControl(this.navParams.data.field||''),
      value: new FormControl(this.navParams.data.value||''),
      // type: new FormControl(this.navParams.data.type||'filter'),
      comparation: new FormControl(this.navParams.data.comparation||'=='),
    });
    this.fields = this.navParams.data.fields || [];
    this.field_value = this.navParams.data.field_value || {};
  }

  // ionViewDidLoad(){
  //   setTimeout(() => {
  //     this.field.setFocus();
  //   }, 700);
  // }

  buttonSave(){
    this.viewCtrl.dismiss(this.filterForm.value);
  }
}
