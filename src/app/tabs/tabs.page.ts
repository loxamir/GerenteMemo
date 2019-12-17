import { Component, OnInit } from '@angular/core';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { LoadingController, Events, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { SalePage } from '../sale/sale.page';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  user: any = {};
  loading: any;
  amount: number = 0;
  order: any;

  constructor(
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public events:Events,
    public modalCtrl: ModalController,
  ){
  }

  async ngOnInit(){
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.user = (await this.pouchdbService.getUser())

    this.loading.dismiss();
    // this.events.unsubscribe('add-product');

    // let order: any = await this.pouchdbService.getDoc('sale.6b184a7c-d332-4826-9150-47189b789383');
    let order: any = await this.pouchdbService.searchDocTypeDataField('sale', '', 0, 'state', 'QUOTATION', 'name', 'increase')
    console.log("order", order);
    if (order[0]){
      this.order = order[0];
      // this.amount = order[0].total;
    }
    this.events.subscribe('changed-sale', (data) => {
      if (data.deleted){
        this.order = undefined;
      } else {
        console.log("data", data);
        this.order = data.doc;
      }
    })

    this.events.subscribe('add-product', async (data) => {
      let total = data.price*data.quantity;
      let line = {
        "product_id": data._id,
        "product_name": data.name,
        "quantity": data.quantity,
        "price": data.price,
        "note": data.note
      }
      if (this.order){
        this.order.lines.push(line);
        this.order.total += total;
      } else {
        let now = new Date().toISOString();
        let order = {
          "contact_name": "meu Nome",
          "name": "",
          "code": "123",
          "date": now,
          "origin_id": null,
          "total": total,
          "residual": 0,
          "note": null,
          "state": "QUOTATION",
          "discount": {
            "value": 0,
            "discountProduct": true,
            "lines": 0
          },
          "payments": [],
          "payment_name": "Credito",
          "invoice": "",
          "invoices": [],
          "amount_unInvoiced": total,
          "seller": {},
          "seller_name": "",
          "currency": {},
          "create_user": "admin",
          "create_time": now,
          "write_user": "admin",
          "write_time": now,
          "lines": [line],
          "docType": "sale",
          "contact_id": "contact.unknown",
          "project_id": "",
          "pay_cond_id": "payment-condition.credit"
          }
          let orderDoc = await this.pouchdbService.createDoc(order);
          console.log("orderDoc", orderDoc);
          this.order = orderDoc;
      }
      // this.events.unsubscribe('open-contact');
    })
  }


  async openOrder() {

    let profileModal = await this.modalCtrl.create({
      component: SalePage,
      componentProps: {
        "select": true,
        "_id": this.order._id,
      }
    })
    profileModal.present();
  }
}
