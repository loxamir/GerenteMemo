import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Platform } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProductService } from './product.service';
import { ActivatedRoute, CanDeactivate } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { AuthService } from "../services/auth.service";
import { Events } from '../services/events';
import { LoginPage } from '../login/login.page';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit, CanDeactivate<boolean> {
  @ViewChild('pwaphoto', { static: false }) pwaphoto: ElementRef;
  @ViewChild('pwacamera', { static: false }) pwacamera: ElementRef;
  @ViewChild('pwagalery', { static: false }) pwagalery: ElementRef;

  @ViewChild('name', { static: true }) name;
  @ViewChild('price', { static: true }) price;
  @ViewChild('cost', { static: true }) cost;
  @ViewChild('type', { static: true }) type;
  @ViewChild('stock', { static: false }) stock;

  @ViewChild('category', { static: true }) category;
  @ViewChild('brand', { static: true }) brand;
  @ViewChild('tax', { static: false })tax;
    productForm: FormGroup;
    loading: any;
    _id: string;
    languages: Array<LanguageModel>;
    theoreticalStock: number = 0;
    opened: boolean = false;
    select;
    avatar = undefined;
    logged: boolean = false;
    asking: boolean = false;
    currency_precision = 0;

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public alertCtrl: AlertController,
      public platform: Platform,
      public productService: ProductService,
      public route: ActivatedRoute,
      public modalCtrl: ModalController,
      public formBuilder: FormBuilder,
      public events:Events,
      public pouchdbService: PouchdbService,
      public authService: AuthService,
    ) {
      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
      if (this.route.snapshot.paramMap.get('_id')){
        this.opened = true;
      }
      this.cost = this.route.snapshot.paramMap.get('cost');
      this.stock = this.route.snapshot.paramMap.get('stock');
    }

    async ngOnInit() {
      setTimeout(() => {
        this.productForm.markAsPristine();
      }, 400);
      this.productForm = this.formBuilder.group({
        name: new FormControl(null, Validators.required),
        image: new FormControl(''),
        price: new FormControl(null, Validators.required),
        category: new FormControl({}),
        brand: new FormControl({}),
        cost: new FormControl(this.cost||null),
        code: new FormControl(''),
        barcode: new FormControl(''),
        tax: new FormControl(this.route.snapshot.paramMap.get('iva')||'iva10'),
        type: new FormControl(this.route.snapshot.paramMap.get('type')||'product'),
        stock: new FormControl(this.stock||null),
        stock_min: new FormControl(this.route.snapshot.paramMap.get('stock_min')),
        note: new FormControl(''),
        date: new FormControl(new Date().toJSON()),
        unity: new FormControl(this.route.snapshot.paramMap.get('unity')||'un'),
        fixed: new FormControl(false),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
        quantity: new FormControl(1),
        products: new FormControl([]),
        sizes: new FormControl([]),
        size: new FormControl(),
        description: new FormControl(''),
        _attachments: new FormControl(),
      });

      this.authService.loggedIn.subscribe(async status => {
        if (status) {
          let data = await this.authService.getData();
          let contact = await this.pouchdbService.getDoc("contact."+data.currentUser.email);
          if (JSON.stringify(contact) != "{}"){
            this.logged = true;
            if(this.asking){
              this.events.publish('add-product', {product: this.productForm.value});
              this.exitPage();
            }
          } else {
            console.log("create user");
          }
        } else {
          this.logged = false;
          this.events.subscribe('login-success', (data) => {
            this.logged = true;
          })
        }
        this.asking = false;
      });
      let language:any = await this.languageService.getDefaultLanguage();
      this.translate.setDefaultLang(language);
      this.translate.use(language);
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      if (this._id){
        this.productService.getProduct(this._id).then((data) => {
          setTimeout(() => {
            if (data.sizes && data.sizes[0]){
              data.size = data.sizes[0].name;
              this.productForm.patchValue({
                size: data.sizes[0].name
              });
            }
          }, 400);
          this.productForm.patchValue(data);
          this.theoreticalStock = data.stock;
          this.productForm.markAsPristine();
          this.loading.dismiss();
        });
      } else {
        this.loading.dismiss();
      }
    }

    async askProduct(){
      let orders:any = await this.pouchdbService.searchDocTypeData(
        'sale', "CONFIRMED", 0, "state");
      if (orders[0]){
        let alertPopup = await this.alertCtrl.create({
            header: this.translate.instant('Pedido Pendiente'),
            message: this.translate.instant('No puedes hacer un nuevo pedido mientras hay otro pendiente'),
            buttons: [{
                    text: this.translate.instant('OK'),
                    handler: () => {
                    }
                }]
        });
        alertPopup.present();
      } else {
        if (this.logged){
          this.events.publish('add-product', {product: this.productForm.value});
          this.exitPage();
        } else {
          this.authLogin();
        }
      }
    }

    async authLogin() {
      let profileModal = await this.modalCtrl.create({
        component: LoginPage,
        componentProps: {}
      })
      profileModal.present();
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
        { type: 'required', message: 'Name is required.' }
      ],
      'price': [
        { type: 'required', message: 'Price is required.' }
      ],
      'cost': [
        { type: 'required', message: 'Cost is required.' }
      ],
      'stock': [
        { type: 'required', message: 'Stock is required.' }
      ]
    };

    onSubmit(values){
      //console.log(values);
    }

    showNextButton(){
      // console.log("stock",this.productForm.value.stock);
      if (this.productForm.value.name==null){
        return true;
      }
      else if (this.productForm.value.price==null){
        return true;
      }
      else if (this.productForm.value.cost==null){
        return true;
      }
      else if (this.productForm.value.type=='product'&&this.productForm.value.stock==null){
        return true;
      }
      else {
        return false;
      }
    }
    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
        if(this.productForm.dirty) {
            let alertPopup = await this.alertCtrl.create({
                header: this.translate.instant('DISCARD'),
                message: this.translate.instant('SURE_DONT_SAVE'),
                buttons: [{
                        text: this.translate.instant('YES'),
                        handler: () => {
                            // alertPopup.dismiss().then(() => {

                                this.exitPage();
                            // });
                        }
                    },
                    {
                        text: this.translate.instant('NO'),
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
        this.productForm.markAsPristine();
        this.navCtrl.navigateBack('/product-list');
      }
    }

    sumItem() {
      let quantity = this.productForm.value.quantity;
      quantity += 1;
      this.productForm.patchValue({
        quantity: quantity
      })
        // this.recomputeValues();
    }

    remItem() {
      let quantity = this.productForm.value.quantity;
      if (quantity>1){
        quantity -= 1;
        this.productForm.patchValue({
          quantity: quantity
        })
      }
    }

  selectSize(item){
    this.productForm.patchValue({
      size: item.name,
      price: item.price
    })
  }

  async selectProduct(product){
    let profileModal = await this.modalCtrl.create({
      component: ProductPage,
      componentProps: {
        "select": true,
        "_id": product._id,
      }
    });
    await profileModal.present();
    await this.loading.dismiss();
    await profileModal.onDidDismiss();
  }

}
