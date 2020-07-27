import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
import { FormatService } from '../services/format.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-ticket-config',
  templateUrl: './ticket-config.page.html',
  styleUrls: ['./ticket-config.page.scss'],
})
export class TicketConfigPage implements OnInit {
  ticketForm: FormGroup;
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
    public formatService: FormatService,
    public pouchdbService: PouchdbService,
  ) { }

  async ngOnInit() {
    this.ticketForm = this.formBuilder.group({
      paperWidth: new FormControl(this.navParams.data.paperWidth),
      marginBottom: new FormControl(this.navParams.data.marginBottom),
      ticketComment: new FormControl(this.navParams.data.ticketComment),
      showSignSeller: new FormControl(this.navParams.data.showSignSeller),
      showSignClient: new FormControl(this.navParams.data.showSignClient),
      receiptPaperWidth: new FormControl(this.navParams.data.receiptPaperWidth),
      receiptMarginBottom: new FormControl(this.navParams.data.receiptMarginBottom),
      receiptComment: new FormControl(this.navParams.data.receiptComment),
      showReceiptSignSeller: new FormControl(this.navParams.data.showReceiptSignSeller),
      showReceiptSignClient: new FormControl(this.navParams.data.showReceiptSignClient),
      servicePaperWidth: new FormControl(this.navParams.data.servicePaperWidth),
      serviceMarginBottom: new FormControl(this.navParams.data.serviceMarginBottom),
      serviceComment: new FormControl(this.navParams.data.serviceComment),
      showServiceSign: new FormControl(this.navParams.data.showServiceSign),
      showServiceSignClient: new FormControl(this.navParams.data.showServiceSignClient),
      closePaperWidth: new FormControl(this.navParams.data.closePaperWidth),
      closeMarginBottom: new FormControl(this.navParams.data.closeMarginBottom),
      showCloseSign: new FormControl(this.navParams.data.showCloseSign),
      showCloseSignSuper: new FormControl(this.navParams.data.showCloseSignSuper),
      ticket_count: new FormControl(this.navParams.data.ticket_count || 1),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }

  async printTest() {
    let ticketData = {
      "contact": {
        "code": "190",
        "name": "Cliente de Ejemplo",
        "phone": "0983-585555",
        "document": "653777-7",
        "address": "SANTA RITA - SINUELO",
        "email": "",
        "customer": true,
        "supplier": false,
        "employee": false,
        "seller": false,
        "note": "",
        "docType": "contact",
      },
      "name": "",
      "contact_name": "Cliente de Ejemplo",
      "code": "001-001-0000002",
      "date": "1999-12-31T12:07:47.265Z",
      "total": 300000,
      "residual": 300000,
      "tax": 36181.818181818184,
      "note": "",
      "state": "PRINTED",
      "items": [
        {
          "product": {
            "code": "021",
            "name": "Producto Iva 10%",
            "price": 100000,
            "stock": 10,
            "tax": "iva10",
            "stock_min": 0,
            "type": "product",
            "note": "",
            "docType": "product"
          },
          "description": "Producto Iva 10%",
          "quantity": "1",
          "price": 100000
        },
        {
          "product": {
            "code": "002",
            "name": "Producto Iva 5%",
            "price": 100000,
            "cost": 50000,
            "stock": 2,
            "tax": "iva5",
            "stock_min": 0,
            "type": "product",
            "note": "",
            "docType": "product"
          },
          "description": "Producto Iva 5%",
          "quantity": "1",
          "price": 100000
        },
        {
          "product": {
            "code": "253",
            "name": "Producto Exento",
            "price": 100000,
            "cost": 50000,
            "stock": 2,
            "tax": "iva0",
            "stock_min": 0,
            "type": "product",
            "note": "",
            "docType": "product"
          },
          "description": "Producto Exento",
          "quantity": "1",
          "price": 100000
        },
      ],
      "type": "out",
      "paymentCondition": "Contado",
      "number": "",
      "currency": {}
    }
    let prompt = await this.alertCtrl.create({
      header: 'Elejir Condición de Pago',
      message: 'Cual es la Condición de Pago de que quieres imprimir?',
      buttons: [
        {
          text: 'Contado',
          handler: data => {
            ticketData.paymentCondition = "Contado";
          }
        },
        {
          text: 'Credito',
          handler: data => {
            ticketData.paymentCondition = "Credito";
          }
        }
      ]
    });
    await prompt.present();
  }

  buttonSave() {
    this.modalCtrl.dismiss(this.ticketForm.value);
  }

  discard() {
    this.canDeactivate();
  }
  async canDeactivate() {
    if (this.ticketForm.dirty) {
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
      this.ticketForm.markAsPristine();
      this.navCtrl.navigateBack('/product-list');
    }
  }
}
