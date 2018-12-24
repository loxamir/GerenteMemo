import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController,  } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'user-page',
  templateUrl: 'user.html'
})
export class UserPage {
  form: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
  }

  ionViewWillLoad() {
    this.form = this.formBuilder.group({
      name: [this.navParams.data.name||''],
      phone: [this.navParams.data.phone||''],
      sale: [this.navParams.data.sale||false],
      purchase: [this.navParams.data.purchase||false],
      finance: [this.navParams.data.finance||false],
      service: [this.navParams.data.service||false],
      report: [this.navParams.data.report||false],
      config: [this.navParams.data.config||false],
    });
  }

  buttonSave(){
    // this.viewCtrl.dismiss(this.form.value);
  }
}