import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Platform, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ProductService } from './product.service';
// import { Base64 } from '@ionic-native/base64';
import { ProductCategoryListPage } from '../product-category-list/product-category-list.page';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { StockMoveService } from '../stock-move/stock-move.service';
import { CashMoveService } from '../cash-move/cash-move.service';
import { ConfigService } from '../config/config.service';
import { ActivatedRoute, CanDeactivate } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit, CanDeactivate<boolean> {

  @ViewChild('name') name;
  @ViewChild('price') price;
  @ViewChild('cost') cost;
  @ViewChild('type') type;
  @ViewChild('stock') stock;
  @ViewChild('barcode') barcode;

    productForm: FormGroup;
    loading: any;
    _id: string;
    languages: Array<LanguageModel>;
    theoreticalStock: number = 0;
    opened: boolean = false;
    select;

    constructor(
      public navCtrl: NavController,
      // public modal: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public alertCtrl: AlertController,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      public platform: Platform,
      public productService: ProductService,
      public configService: ConfigService,
      public route: ActivatedRoute,
      public modalCtrl: ModalController,
      public formBuilder: FormBuilder,
      // public base64: Base64,
      public events:Events,
      // public camera: Camera,
      public pouchdbService: PouchdbService,
      public stockMoveService: StockMoveService,
      public cashMoveService: CashMoveService,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
      if (this.route.snapshot.paramMap.get('_id')){
        this.opened = true;
      }
      this.barcode = this.route.snapshot.paramMap.get('barcode');
      this.cost = this.route.snapshot.paramMap.get('cost');
      this.stock = this.route.snapshot.paramMap.get('stock');
      // if (this.route.snapshot.paramMap.get('cost') == undefined){
      //   this.route.snapshot.paramMap.get('cost') = '';
      // }
      // if (this.route.snapshot.paramMap.get('code') == undefined){
      //   this.route.snapshot.paramMap.get('code') = '';
      // }
      // if (this.route.snapshot.paramMap.get('barcode') == undefined){
      //   this.route.snapshot.paramMap.get('barcode') = '';
      // }
      // if (this.route.snapshot.paramMap.get('tax') == undefined){
      //   this.route.snapshot.paramMap.get('tax') = '';
      // }
      // if (this.route.snapshot.paramMap.get('type') == undefined){
      //   this.route.snapshot.paramMap.get('type') = '';
      // }
      // if (this.route.snapshot.paramMap.get('stock') == undefined){
      //   this.route.snapshot.paramMap.get('stock') = '';
      // }
      // if (this.route.snapshot.paramMap.get('stock_min') == undefined){
      //   this.route.snapshot.paramMap.get('stock_min') = 0;
      // }
    }

    async ngOnInit() {
      setTimeout(() => {
        this.name.setFocus();
        this.productForm.markAsPristine();
      }, 400);
      this.productForm = this.formBuilder.group({
        name: new FormControl(null, Validators.required),
        // image: new FormControl(''),
        price: new FormControl(null, Validators.required),
        category: new FormControl({}),
        cost: new FormControl(this.cost||null),
        code: new FormControl(''),
        barcode: new FormControl(this.barcode),
        tax: new FormControl(this.route.snapshot.paramMap.get('iva')||'iva10'),
        type: new FormControl(this.route.snapshot.paramMap.get('type')||'product'),
        stock: new FormControl(this.stock||null),
        stock_min: new FormControl(this.route.snapshot.paramMap.get('stock_min')),
        note: new FormControl(''),
        date: new FormControl(new Date().toJSON()),
        unity: new FormControl(this.route.snapshot.paramMap.get('unity')||'un'),
        _id: new FormControl(''),
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      if (this._id){
        this.productService.getProduct(this._id).then((data) => {
          this.productForm.patchValue(data);
          this.theoreticalStock = data.stock;
          this.productForm.markAsPristine();
          this.loading.dismiss();
        });
      } else {
        this.getDefaultCategory();
        this.loading.dismiss();
      }
    }

    getDefaultCategory(){
      if (this._id){
        //TODO: find a way to avoid the loading time
      } else {
        this.pouchdbService.getDoc('category.'+this.productForm.value.type).then((category)=>{
          this.productForm.patchValue({
            category: category
          })
        })
      }
    }

    goNextStep() {
        if (this.productForm.value.name==null){
          this.name.setFocus();
        }
        else if (this.productForm.value.price==null){
          this.price.setFocus();
        }
        else if (this.productForm.value.cost==null){
          this.cost.setFocus();
        }
        else if (this.productForm.value.stock==null){
          this.stock.setFocus();
          return;
        }
        else if (this.productForm.dirty) {
          this.buttonSave();
        } else {
          if (this.opened){
            this.navCtrl.navigateBack('/tabs/product-list');
            // .then(() => {
              this.events.publish('open-product', this.productForm.value);
            // });
          } else {
            this.navCtrl.navigateBack('/tabs/product-list');
            // .then(() => {
              this.events.publish('create-product', this.productForm.value);
            // });
          }
        }

        // else if (Object.keys(this.productForm.value.accountFrom).length === 0){
        //   this.selectAccountFrom();
        //   return;
        // }
        // else if (Object.keys(this.productForm.value.accountTo).length === 0){
        //   this.selectAccountTo();
        //   return;
        // }
        // else if (!this.transfer && Object.keys(this.productForm.value.contact).length === 0){
        //   this.selectContact();
        //   return;
        // }
        // else {
        //   let prompt = this.alertCtrl.create({
        //     title: 'Confirmar',
        //     message: 'Estas seguro que deseas confirmar el movimiento?',
        //     buttons: [
        //       {
        //         text: 'No',
        //         handler: data => {
        //         }
        //       },
        //       {
        //         text: 'Si',
        //         handler: data => {
        //           // this.addTravel();
        //           this.confirmCashMove();
        //         }
        //       }
        //     ]
        //   });
        //   prompt.present();
        // }
      // }
      // else {
      //   this.navCtrl.navigateBack();
      // }
    }

    justSave() {
      let product = Object.assign({}, this.productForm.value);
      // if(this.productForm.value.stock != this.theoreticalStock){
        product.stock = this.theoreticalStock;
      // }
      if (this._id){
        this.productService.updateProduct(product).then(doc=>{
          this.createInventoryAdjustment();
          this.productForm.markAsPristine();
        })
      } else {
        this.productService.createProduct(product).then(doc => {
          //console.log("docss", doc);
          this.productForm.patchValue({
            _id: doc['id'],
          });
          this._id = doc['id'];
          this.createInventoryAdjustment();
          this.productForm.markAsPristine();
        });
      }
    }
    buttonSave() {
      let product = Object.assign({}, this.productForm.value);
      product.quantity = parseFloat(product.quantity) || 0;
      product.cost = parseFloat(product.cost) || 0;
      product.price = parseFloat(product.price) || 0;
      product.stock_min = parseFloat(product.stock_min) || 0;
      console.log("product", product);
      // if(this.productForm.value.stock != this.theoreticalStock){
        product.stock = this.theoreticalStock;
      // }
      if (this._id){
        this.productService.updateProduct(product).then(doc=>{
          this.createInventoryAdjustment();
        })
        if (this.select){
          this.modalCtrl.dismiss();
          this.events.publish('open-product', this.productForm.value);
        } else {
          this.navCtrl.navigateBack('/tabs/product-list');
          // .then(() => {
            this.events.publish('open-product', this.productForm.value);
          // });
        }
      } else {
        this.productService.createProduct(product).then(doc => {
          //console.log("docss", doc);
          this.productForm.patchValue({
            _id: doc['id'],
          });
          this._id = doc['id'];
          this.createInventoryAdjustment();
          if (this.select){
            this.modalCtrl.dismiss();
            this.events.publish('create-product', this.productForm.value);
          } else {
            this.navCtrl.navigateBack('/tabs/product-list');
            // .then(() => {
              this.events.publish('create-product', this.productForm.value);
            // });
          }
        });
      }
    }

    createInventoryAdjustment(){
      if(this.productForm.value.stock != this.theoreticalStock){
        this.configService.getConfigDoc().then((config: any)=>{
          let difference = (this.productForm.value.stock - this.theoreticalStock);
          let warehouseFrom_id = 'warehouse.inventoryAdjust';
          let warehouseTo_id  = config.warehouse_id;
          let accountFrom_id = 'account.income.positiveInventory';
          let accountTo_id  = 'account.other.stock';
          if (difference < 0) {
            warehouseFrom_id  = config.warehouse_id;
            warehouseTo_id = 'warehouse.inventoryAdjust';
            accountFrom_id = 'account.other.stock';
            accountTo_id  = 'account.expense.negativeInventory';
          }
          this.stockMoveService.createStockMove({
            'name': "Ajuste "+this.productForm.value.code,
            'quantity': Math.abs(difference),
            'origin_id': this.productForm.value._id,
            'contact_id': "contact.myCompany",
            'product_id': this.productForm.value._id,
            'date': new Date(),
            'cost': (parseFloat(this.productForm.value.cost)||0)*Math.abs(difference),
            'warehouseFrom_id': warehouseFrom_id,
            'warehouseTo_id': warehouseTo_id,
          }).then(res => {
            console.log("res", res);
          });

          this.cashMoveService.createCashMove({
            'name': "Ajuste "+this.productForm.value.code,
            'contact_id': "contact.myCompany",
            'amount': (parseFloat(this.productForm.value.cost)||0)*Math.abs(difference),
            'origin_id': this.productForm.value._id,
            // "project_id": this.productForm.value.project_id,
            'date': new Date(),
            'accountFrom_id': accountFrom_id,
            'accountTo_id': accountTo_id,
          }).then((plan: any) => {
            //console.log("Plan", plan);
            // data['_id'] = plan.id;
            // this.saleForm.value.planned.push(data);
          })
        });
      }
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

    // selectCategory() {
    //     this.events.subscribe('select-category', (data) => {
    //       this.productForm.patchValue({
    //         category: data,
    //       });
    //       this.productForm.markAsDirty();
    //       this.events.unsubscribe('select-category');
    //     })
    //     this.navCtrl.navigateForward(['product-category-list', {
    //       "select": true
    //     }]);
    // }

    selectCategory() {
      return new Promise(async resolve => {
        // this.avoidAlertMessage = true;
        let profileModal = await this.modalCtrl.create({
          component: ProductCategoryListPage,
          componentProps: {
            "select": true,
          }
        });
        await profileModal.present();
        this.events.unsubscribe('select-category');
        this.events.subscribe('select-category', (data) => {
          this.productForm.patchValue({
            category: data,
            category_name: data.name,
          });
          this.productForm.markAsDirty();
          // this.avoidAlertMessage = false;
          this.events.unsubscribe('select-category');
          profileModal.dismiss();
          // resolve(true);
        })
      });
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
        this.productForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/product-list');
      }
    }

}
