import { Component, OnInit } from '@angular/core';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { LoadingController, Events, ModalController, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { SalePage } from '../sale/sale.page';
import { AuthService } from "../services/auth.service";

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
  logged: boolean = false;
  contact_id;
  contact_name;

  constructor(
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public events:Events,
    public modalCtrl: ModalController,
    public menuCtrl: MenuController,
    public authService: AuthService,
  ){
  }

  async ngOnInit(){
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.user = (await this.pouchdbService.getUser())


    this.authService.loggedIn.subscribe(async status => {

      console.log("status", status);
      if (status) {
        this.logged = true;
        let data = await this.authService.getData();
        this.contact_id = "contact."+data.currentUser.email;
        this.contact_name = data.currentUser.displayName;
        this.loading.dismiss();
        let order: any = await this.pouchdbService.searchDocTypeData('sale',this.contact_id,0,"contact_id");
        if (order[0]){
          if (order[0].state == 'QUOTATION'
          || order[0].state == 'CONFIRMED'
        ){
            this.order = order[0];
          }
        }
        this.events.subscribe('changed-sale', (data) => {
          if (data.deleted){
            this.order = undefined;
          } else {
            if (data.doc.state == 'QUOTATION' || data.doc.state == 'CONFIRMED'){
              this.order = data.doc;
            } else if (data.doc.state == 'PAID'){
              this.order = undefined;
            }
          }
        })
      } else {
        this.logged = false;
      }
    });



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
        this.order.amount_unInvoiced += total;
        this.order.residual += total;
        let updatedOrder:any = await this.pouchdbService.updateDoc(this.order);
        console.log("updatedOrder", updatedOrder);
        this.order._rev = updatedOrder.rev;

      } else {
        let now = new Date().toISOString();
        let order = {
          "contact_name": this.contact_name,
          "name": "",
          "code": "123",
          "date": now,
          "origin_id": null,
          "total": total,
          "residual": total,
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
          "contact_id": this.contact_id,
          "project_id": "",
          "pay_cond_id": "payment-condition.credit"
          }
          let orderDoc = await this.pouchdbService.createDoc(order);
          console.log("orderDoc", orderDoc);
          this.order = orderDoc;
      }
      // this.events.unsubscribe('open-contact');
    })
    this.menuCtrl.enable(false);
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
