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
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  ngOnInit() {
    this.ticketForm = this.formBuilder.group({
      paperWidth: new FormControl(this.navParams.data.paperWidth),
      marginBottom: new FormControl(this.navParams.data.marginBottom),
      ticketComment: new FormControl(this.navParams.data.ticketComment),
      showSignSeller: new FormControl(this.navParams.data.showSignSeller),
      showSignClient: new FormControl(this.navParams.data.showSignClient),
    });
  }

  async printTest(){
    // let dotmatrix_model:any = await this.pouchdbService.getDoc('config.ticket');
    // let layout = await this.pouchdbService.getDoc('config.profile');
    let ticketData = {
      "contact":{
        "code":"190",
        "name":"Cliente de Ejemplo",
        "phone":"0983-585555",
        "document":"653777-7",
        "address":"SANTA RITA - SINUELO",
        "email":"",
        "customer":true,
        "supplier":false,
        "employee":false,
        "seller":false,
        "note":"",
        "docType":"contact",
        },
        "name":"",
        "contact_name":"Cliente de Ejemplo",
        "code":"001-001-0000002",
        "date":"1999-12-31T12:07:47.265Z",
        "total":300000,
        "residual":300000,
        "tax":36181.818181818184,
        "note":"",
        "state":"PRINTED",
        "items":[
          {
            "product":{
              "code":"021",
              "name":"Producto Iva 10%",
              "price":100000,
              "stock":10,
              "tax":"iva10",
              "stock_min":0,
              "type":"product",
              "note":"",
              "docType":"product"
            },
            "description":"Producto Iva 10%",
            "quantity":"1",
            "price":100000
          },
          {
            "product":{
              "code":"002",
              "name":"Producto Iva 5%",
              "price":100000,
              "cost":50000,
              "stock":2,
              "tax":"iva5",
              "stock_min":0,
              "type":"product",
              "note":"",
              "docType":"product"
            },
            "description":"Producto Iva 5%",
            "quantity":"1",
            "price":100000
          },
          {
            "product":{
              "code":"253",
              "name":"Producto Exento",
              "price":100000,
              "cost":50000,
              "stock":2,
              "tax":"iva0",
              "stock_min":0,
              "type":"product",
              "note":"",
              "docType":"product"
            },
            "description":"Producto Exento",
            "quantity":"1",
            "price":100000
          },
        ],
        "type":"out",
        "paymentCondition":"Contado",
        "number":"",
        "currency":{}
      }
    // async informNumberSupplier(code){
      let prompt = await this.alertCtrl.create({
        header: 'Elejir Condición de Pago',
        message: 'Cual es la Condición de Pago de que quieres imprimir?',
        buttons: [
          {
            text: 'Contado',
            handler: data => {
              ticketData.paymentCondition = "Contado";
              // this.formatService.printTicket(
              //   ticketData,
              //   this.ticketForm.value
              // );
            }
          },
          {
            text: 'Credito',
            handler: data => {
              ticketData.paymentCondition = "Credito";
              // this.formatService.printTicket(
              //   ticketData,
              //   this.ticketForm.value
              // );
            }
          }
        ]
      });

    await prompt.present();
    // }



  }

  buttonSave(){
    this.modalCtrl.dismiss(this.ticketForm.value);
  }


  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.ticketForm.dirty) {
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
      this.ticketForm.markAsPristine();
      this.navCtrl.navigateBack('/product-list');
    }
  }
}
