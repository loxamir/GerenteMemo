import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  form: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;
  select = true;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  ngOnInit() {
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
    this.modalCtrl.dismiss(this.form.value);
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.form.dirty) {
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
      this.form.markAsPristine();
      this.navCtrl.navigateBack('/tabs/product-list');
    }
  }
}
