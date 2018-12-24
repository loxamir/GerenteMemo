import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
@Component({
  selector: 'input-page',
  templateUrl: 'input.html'
})
export class SalaryInputPage {
  inputForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
  }

  ionViewWillLoad() {
    this.inputForm = this.formBuilder.group({
      name: new FormControl(this.navParams.data.name||''),
      amount: new FormControl(this.navParams.data.amount||0),
    });
  }

  buttonSave(){
    // this.viewCtrl.dismiss(this.inputForm.value);
  }
}
