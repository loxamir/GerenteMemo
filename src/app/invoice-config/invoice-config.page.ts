import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-invoice-config',
  templateUrl: './invoice-config.page.html',
  styleUrls: ['./invoice-config.page.scss'],
})
export class InvoiceConfigPage implements OnInit {
  invoiceForm: FormGroup;
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
    this.invoiceForm = this.formBuilder.group({
      contactName_top: new FormControl(this.navParams.data.contactName_top),
      contactName_left: new FormControl(this.navParams.data.contactName_left),
      contactName_width: new FormControl(this.navParams.data.contactName_width),
      invoiceNumber_top: new FormControl(this.navParams.data.invoiceNumber_top),
      invoiceNumber_left: new FormControl(this.navParams.data.invoiceNumber_left),
      invoiceDateType: new FormControl(this.navParams.data.invoiceDateType),
      invoiceDate_top: new FormControl(this.navParams.data.invoiceDate_top),
      invoiceDate_left: new FormControl(this.navParams.data.invoiceDate_left),
      invoiceMonth_left: new FormControl(this.navParams.data.invoiceMonth_left),
      invoiceYear_left: new FormControl(this.navParams.data.invoiceYear_left),
      invoicePayment_top: new FormControl(this.navParams.data.invoicePayment_top),
      invoicePaymentType: new FormControl(this.navParams.data.invoicePaymentType),
      invoicePayment_left: new FormControl(this.navParams.data.invoicePayment_left),
      invoicePayment_width: new FormControl(this.navParams.data.invoicePayment_width),
      invoicePaymentCredit_top: new FormControl(this.navParams.data.invoicePaymentCredit_top),
      invoicePaymentCredit_left: new FormControl(this.navParams.data.invoicePaymentCredit_left),
      contactDocument_top: new FormControl(this.navParams.data.contactDocument_top),
      contactDocument_left: new FormControl(this.navParams.data.contactDocument_left),
      contactDocument_width: new FormControl(this.navParams.data.contactDocument_width),
      contactAddress_top: new FormControl(this.navParams.data.contactAddress_top),
      contactAddress_left: new FormControl(this.navParams.data.contactAddress_left),
      contactAddress_width: new FormControl(this.navParams.data.contactAddress_width),
      contactPhone_top: new FormControl(this.navParams.data.contactPhone_top),
      contactPhone_left: new FormControl(this.navParams.data.contactPhone_left),
      contactPhone_width: new FormControl(this.navParams.data.contactPhone_width),

      lines_top: new FormControl(this.navParams.data.lines_top),
      lines_width: new FormControl(this.navParams.data.lines_width),
      lines_limit: new FormControl(this.navParams.data.lines_limit),
      lines_height: new FormControl(this.navParams.data.lines_height),
      linesQuantity_width: new FormControl(this.navParams.data.linesQuantity_width),
      linesProductName_width: new FormControl(this.navParams.data.linesProductName_width),
      linesPrice_width: new FormControl(this.navParams.data.linesPrice_width),
      linesTax0_width: new FormControl(this.navParams.data.linesTax0_width),
      linesTax5_width: new FormControl(this.navParams.data.linesTax5_width),
      linesTax10_width: new FormControl(this.navParams.data.linesTax10_width),

      subTotalTax0_top: new FormControl(this.navParams.data.subTotalTax0_top),
      subTotalTax0_left: new FormControl(this.navParams.data.subTotalTax0_left),
      subTotalTax0_width: new FormControl(this.navParams.data.subTotalTax0_width),
      subTotalTax5_top: new FormControl(this.navParams.data.subTotalTax5_top),
      subTotalTax5_left: new FormControl(this.navParams.data.subTotalTax5_left),
      subTotalTax5_width: new FormControl(this.navParams.data.subTotalTax5_width),
      subTotalTax10_top: new FormControl(this.navParams.data.subTotalTax10_top),
      subTotalTax10_left: new FormControl(this.navParams.data.subTotalTax10_left),
      subTotalTax10_width: new FormControl(this.navParams.data.subTotalTax10_width),
      amountInWords_top: new FormControl(this.navParams.data.amountInWords_top),
      amountInWords_left: new FormControl(this.navParams.data.amountInWords_left),
      amountInWords_width: new FormControl(this.navParams.data.amountInWords_width),
      invoiceTotal_top: new FormControl(this.navParams.data.invoiceTotal_top),
      invoiceTotal_left: new FormControl(this.navParams.data.invoiceTotal_left),
      invoiceTotal_width: new FormControl(this.navParams.data.invoiceTotal_width),
      totalTax5_top: new FormControl(this.navParams.data.totalTax5_top),
      totalTax5_left: new FormControl(this.navParams.data.totalTax5_left),
      totalTax5_width: new FormControl(this.navParams.data.totalTax5_width),
      totalTax10_top: new FormControl(this.navParams.data.totalTax10_top),
      totalTax10_left: new FormControl(this.navParams.data.totalTax10_left),
      totalTax10_width: new FormControl(this.navParams.data.totalTax10_width),
      totalTax_top: new FormControl(this.navParams.data.totalTax_top),
      totalTax_left: new FormControl(this.navParams.data.totalTax_left),
      totalTax_width: new FormControl(this.navParams.data.totalTax_width),
      copy_count: new FormControl(this.navParams.data.copy_count),
      copy_height: new FormControl(this.navParams.data.copy_height),
      invoice_height: new FormControl(this.navParams.data.invoice_height),

      marginTop_config: new FormControl(this.navParams.data.marginTop_config),
      marginLeft_config: new FormControl(this.navParams.data.marginLeft_config),
      printerFactor_config: new FormControl(this.navParams.data.printerFactor_config),
    });
  }

  buttonSave(){
    this.modalCtrl.dismiss(this.invoiceForm.value);
  }


  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.invoiceForm.dirty) {
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
      this.invoiceForm.markAsPristine();
      this.navCtrl.navigateBack('/product-list');
    }
  }
}
