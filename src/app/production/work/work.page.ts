import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, ModalController, LoadingController, Events, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ContactListPage } from '../../contact-list/contact-list.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-work',
  templateUrl: './work.page.html',
  styleUrls: ['./work.page.scss'],
})
export class ProductionWorkPage implements OnInit {
  @ViewChild('description', { static: true }) descriptionField;
  @ViewChild('time', { static: true }) timeField;
  workForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;
  select = true;
  @Input() description;
  @Input() date;
  @Input() time;
  @Input() responsible;

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
  ) {
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
  }

  async ngOnInit() {
    this.workForm = this.formBuilder.group({
      description: new FormControl(this.description || null),
      date: new FormControl(this.date || new Date().toISOString()),
      time: new FormControl(this.time || null),
      responsible: new FormControl(this.route.snapshot.paramMap.get('responsible') || ''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    setTimeout(() => {
      this.timeField.setFocus();
    }, 200);
  }

  buttonSave() {
    this.modalCtrl.dismiss(this.workForm.value);
  }

  selectResponsible() {
    return new Promise(async resolve => {
      this.events.unsubscribe('select-contact');
      this.events.subscribe('select-contact', (data) => {
        this.workForm.patchValue({
          responsible: data,
        });
        this.workForm.markAsDirty();
        this.events.unsubscribe('select-contact');
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ContactListPage,
        componentProps: { "select": true, "filter": "employee" }
      });
      profileModal.present();
    });
  }

  async goNextStep() {
    if (this.workForm.value.time == null) {
      this.timeField.setFocus();
      return;
    }
  }


  showNextButton() {
    if (this.workForm.value.time == null) {
      return true;
    }
    else {
      return false;
    }
  }

  discard() {
    this.canDeactivate();
  }

  async canDeactivate() {
    if (this.workForm.dirty) {
      let alertPopup = await this.alertCtrl.create({
        header: this.translate.instant('DISCARD'),
        message: this.translate.instant('SURE_DONT_SAVE'),
        buttons: [{
          text: this.translate.instant('YES'),
          handler: () => {
            this.exitPage();
          }
        },
        {
          text: this.translate.instant('NO'),
          handler: () => {
          }
        }]
      });
      alertPopup.present();
      return false;
    } else {
      this.exitPage();
    }
  }

  private exitPage() {
    if (this.select) {
      this.modalCtrl.dismiss();
    } else {
      this.workForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/sale-list');
    }
  }


}
