import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, ModalController, LoadingController, Events, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ContactListPage } from '../../contact-list/contact-list.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListPage } from '../../product-list/product-list.page';

@Component({
  selector: 'app-work',
  templateUrl: './work.page.html',
  styleUrls: ['./work.page.scss'],
})
export class ServiceWorkPage implements OnInit {
  @ViewChild('description', { static: true }) descriptionField;
  @ViewChild('quantity', { static: true }) quantityField;
  workForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;
  select = true;
  @Input() description;
  @Input() date;
  @Input() quantity;
  @Input() responsible;
  @Input() product;

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
      description: new FormControl(this.description || this.product && this.product.name || null),
      date: new FormControl(this.date || new Date().toISOString()),
      responsible: new FormControl(this.responsible || {}),
      product: new FormControl(this.product || {}),
      price: new FormControl(this.product && this.product.price || 0),
      cost: new FormControl(this.product && this.product.cost || 0),
      quantity: new FormControl(1),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    setTimeout(() => {
      this.quantityField.setFocus();
      this.workForm.markAsDirty();
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

  selectProduct() {
    if (this.workForm.value.state != 'PAID') {
      return new Promise(async resolve => {
        this.events.unsubscribe('select-product');
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true,
            // "type": "service",
          }
        });
        await profileModal.present();
        this.events.subscribe('select-product', (data) => {
          this.workForm.patchValue({
            product: data,
            description: data.name,
            price: data.price,
            cost: data.cost,
          });
          this.workForm.markAsDirty();
          profileModal.dismiss();
          this.events.unsubscribe('select-product');
          resolve(data);
        })
      });
    }
  }

  async goNextStep() {
    if (this.workForm.value.description == null) {
      this.descriptionField.setFocus();
      return;
    }
    else if (this.workForm.value.quantity == null) {
      this.quantityField.setFocus();
      return;
    }
  }


  showNextButton() {
    if (this.workForm.value.description == null) {
      return true;
    }
    else if (this.workForm.value.quantity == null) {
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
