import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController,  } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'equipment-page',
  templateUrl: 'equipment.html'
})
export class ServiceEquipmentPage {
  equipmentForm: FormGroup;
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
    this._id = this.route.snapshot.paramMap.get(_id);
  }

  ionViewWillLoad() {
    this.equipmentForm = this.formBuilder.group({
      name: new FormControl(this.navParams.data.name||''),
      number: new FormControl(this.navParams.data.number||''),
      brand: new FormControl(this.navParams.data.brand||''),
      model: new FormControl(this.navParams.data.model||''),
      note: new FormControl(this.navParams.data.note||''),
    });
  }

  buttonSave(){
    // this.viewCtrl.dismiss(this.equipmentForm.value);
  }
}
