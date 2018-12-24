import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController,  Events, TextInput } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { AdvanceService } from './advance.service';
import { RestProvider } from "../services/rest/rest";
import { ContactsPage } from '../contact/list/contacts';
import { CashMoveService } from '../cash/move/cash-move.service';
import { ReceiptPage } from '../receipt/receipt';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { Printer, PrintOptions } from '@ionic-native/printer';
import { ConfigService } from '../config/config.service';

@Component({
  selector: 'advance-page',
  templateUrl: 'advance.html'
})
export class AdvancePage {
@ViewChild('name') name: TextInput;
@ViewChild('amount') amount: TextInput;

  advanceForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  opened: boolean = false;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public advanceService: AdvanceService,
    public restProvider: RestProvider,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
    public events: Events,
    public cashMoveService: CashMoveService,
    public pouchdbService: PouchdbService,
    public printer: Printer,
    public configService: ConfigService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    if (this.navParams.data._id){
      this.opened = true;
    }
  }

  ionViewWillLoad() {
    this.advanceForm = this.formBuilder.group({
      name: new FormControl(this.navParams.data.name||'', Validators.required),
      amount: new FormControl(this.navParams.data.amount||''),
      contact: new FormControl(this.navParams.data.contact||''),
      date: new FormControl(this.navParams.data.date||new Date().toISOString()),
      state: new FormControl(this.navParams.data.state||'DRAFT'),
      cash_move: new FormControl(this.navParams.data.cash_move||''),
      payments: new FormControl(this.navParams.data.payments||[]),
      _id: new FormControl(''),
    });
  }

  selectContact() {
    // if (this.advanceForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.advanceForm.patchValue({
            contact: data,
            contact_name: data.name,
          });
          this.advanceForm.markAsDirty();
          this.events.unsubscribe('select-contact');
          resolve(true);
        })
        let profileModal = this.modal.create(ContactsPage, {
          "select": true,
          "filter": "employee",
          'employee': true,
        });
        profileModal.present();
      });
    // }
  }


  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.advanceService.getAdvance(this._id).then((data) => {
        this.advanceForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
  }

  goNextStep() {
    // if (this.advanceForm.value.state == 'DRAFT'){
      if (!this.advanceForm.value.amount){
        this.amount.setFocus();
        // return;
      }
      else if (!this.advanceForm.value.name){
        this.name.setFocus();
        // return;
      } else {
        this.createCashMove();
      }
      // else if (this.advanceForm.value.document&&!this.advanceForm.value.name_legal){
      //   this.getLegalName();
      //   // return;
      // }
      // else if (this.advanceForm.dirty) {
      //   this.justSave();
      // } else {
      //   if (this.opened){
      //     this.navCtrl.navigateBack().then(() => {
      //       this.events.publish('open-advance', this.advanceForm.value);
      //     });
      //   } else {
      //     this.navCtrl.navigateBack().then(() => {
      //       this.events.publish('create-advance', this.advanceForm.value);
      //     });
      //   }
      // }
  }

  // getLegalName(){
  //   this.restProvider.getRucName(this.advanceForm.value.document).then((data: any)=>{
  //     this.advanceForm.patchValue({
  //       'name_legal': data.name,
  //     })
  //   })
  // }
  justSave() {
    if (this._id){
      this.advanceService.updateAdvance(this.advanceForm.value);
      this.advanceForm.markAsPristine();
    } else {
      this.advanceService.createAdvance(this.advanceForm.value).then((doc: any) => {
        this._id = doc.doc.id;
        this.advanceForm.patchValue({
          _id: doc.doc.id,
        })
        this.advanceForm.markAsPristine();
      });
    }
  }

  buttonSave() {
    if (this._id){
      this.advanceService.updateAdvance(this.advanceForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-advance', this.advanceForm.value);
      });
    } else {
      this.advanceService.createAdvance(this.advanceForm.value).then((doc: any) => {
        this._id = doc.doc.id;
        this.advanceForm.patchValue({
          _id: doc.doc.id,
        })
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-advance', this.advanceForm.value);
        });
      });
    }
  }

  createCashMove(){
    this.justSave();
    this.cashMoveService.createCashMove({
      "amount": this.advanceForm.value.amount,
      "name": this.advanceForm.value.name,
      "date": new Date().toISOString(),
      "accountFrom_id": 'account.payable.cash',
      "accountTo_id": 'account.other.salary',
      "contact_id": this.advanceForm.value.contact._id,
      'signal': '-',
      "payments": [],
      "residual": this.advanceForm.value.amount,
      "origin_id": this.advanceForm.value._id,
    }).then((data: any)=>{
      this.advanceForm.patchValue({
        'cash_move': data.id,
      })
      this.justSave();
      this.events.publish('create-advance', this.advanceForm.value);
    })
  }

  setLanguage(lang: LanguageModel){
    let language_to_set = this.translate.getDefaultLang();

    if(lang){
      language_to_set = lang.code;
    }
    this.translate.setDefaultLang(language_to_set);
    this.translate.use(language_to_set);
  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'El Nombre es un campo Necesario' }
    ],
    'document': [
      { type: 'pattern', message: 'Use solo numeros y "-" por ejemplo: 4444444-4.' },
    ],
  };

  onSubmit(values){
    //console.log("teste", values);
  }

  openPayment(item) {
    this.events.unsubscribe('open-receipt');
    this.events.subscribe('open-receipt', (data) => {
      this.events.unsubscribe('open-receipt');
    });
    let profileModal = this.modal.create(ReceiptPage, {
      "_id": item._id,
    });
    profileModal.present();
  }

  recomputeValues(){

  }

  async addPayment() {
      this.events.unsubscribe('create-receipt');
      this.events.subscribe('create-receipt', (data) => {
          console.log("DDDDDDDATA", data);
          this.advanceForm.value.payments.push({
            'paid': data.paid,
            'date': data.date,
            'state': data.state,
            '_id': data._id,
          });
        this.recomputeValues();
        this.buttonSave();
        this.events.unsubscribe('create-receipt');
      });
      let plannedItems = [await this.pouchdbService.getDoc(this.advanceForm.value.cash_move)];

      let profileModal = this.modal.create(ReceiptPage, {
        // "addPayment": true,
        "contact": this.advanceForm.value.contact,
        // "account_id": "account.income.sale",
        "origin_id": this.advanceForm.value._id,
        "name": "Pago "+this.advanceForm.value.name,
        // "accountFrom_id": 'this.advanceForm.value.paymentCondition.accountTo_id',
        "items": plannedItems,
        "signal": "-",
      });
      profileModal.present();
  }

  printAndroid(){
    this.configService.getConfigDoc().then((data) => {
      this.printer.isAvailable().then(onSuccess => {
      }, onError => {
      });
      let options: PrintOptions = {
         name: 'Salario',
         duplex: false,
         landscape: false,
         grayscale: true
      };
      let result = `
      <span style="">
        <div class="page">
            <div class="row">
                <div class="col-xs-5" style="border: 1px solid white;border-radius:6px;width: 800px">
                    <div class="col-xs-4" style="margin-top:5px;margin-bottom:5px;width:800px">
                        <br/>
                        <h1>Recibo de Anticipo de Salario</h1>
                        <br/>
                   </div>
                    <div class="col-xs-4" style="margin-top:5px;margin-bottom:5px;width:800px;border: 1px solid white;">
                        <br/><br/>
                        <div style="font-size:15px">Declaro haber recibido de  <t t-esc="res_company.name"/>  la suma de:  <span t-field="o.amount" t-field-options="{&quot;widget&quot;: &quot;monetary&quot;, &quot;display_currency&quot;: &quot;o.currency_id&quot;}"/>
                        en concepto de: ANTICIPO DE SALARIO, en la fecha <span t-field="o.date"/> <br/>
                        Autorizando por medio de este a <t t-esc="res_company.name"/> debitar este monto de mi sueldo de acuerdo a lo siguiente:
                        </div>
                        <table>
                          <tr>
                            <td width="40%">
                              Monto
                            </td>
                            <td width="40%">
                              Fecha
                            </td>
                          </tr>
                          <tr t-foreach="o.line_ids" t-as="line">
                            <td>
                              <span t-field="line.amount" t-field-options="{&quot;widget&quot;: &quot;monetary&quot;, &quot;display_currency&quot;: &quot;o.currency_id&quot;}"/>
                            </td>
                            <td>
                              <span t-field="line.date"/>
                            </td>
                          </tr>
                        </table>
                    </div>
                    <br/>
                    <br/>
                   <div style="width:50%;margin-left: 25%; border-top: 1px solid black;margin-top: 40%; text-align:center;display:block;">
                   <t t-esc="o.employee_id.name"/> <br/>
                   <t t-esc="o.employee_id.identification_id"/>

                   </div>
                </div>
            </div>
        </div>
      </span>`;
      this.printer.print(result, options).then(onSuccess => {}, onError => {});
    });
  }
}
