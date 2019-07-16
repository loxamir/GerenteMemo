import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController,  Events } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-filter',
  templateUrl: './dashboard-filter.page.html',
  styleUrls: ['./dashboard-filter.page.scss'],
})
export class DashboardFilterPage implements OnInit {
  // @ViewChild('field') field: TextInput;
    filterForm: FormGroup;
    loading: any;
    languages: Array<LanguageModel>;
    fields: any = [];
    field_value: any = {};

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public route: ActivatedRoute,

      public formBuilder: FormBuilder,
    ) {
      this.languages = this.languageService.getLanguages();
    }

    ngOnInit() {
      this.filterForm = this.formBuilder.group({
        field: new FormControl(this.route.snapshot.paramMap.get('field')||''),
        value: new FormControl(this.route.snapshot.paramMap.get('value')||''),
        // type: new FormControl(this.route.snapshot.paramMap.get('type||'filter'),
        comparation: new FormControl(this.route.snapshot.paramMap.get('comparation')||'=='),
      });
      this.fields = this.route.snapshot.paramMap.get('fields') || [];
      this.field_value = this.route.snapshot.paramMap.get('field_value') || {};
    }

    // ionViewDidLoad(){
    //   setTimeout(() => {
    //     this.field.setFocus();
    //   }, 700);
    // }

    buttonSave(){
      // this.viewCtrl.dismiss(this.filterForm.value);
    }

}
