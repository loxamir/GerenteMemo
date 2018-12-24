import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController, LoadingController, Platform, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { ProductService } from './product.service';
// import { Base64 } from '@ionic-native/base64';
// import { CategoriesPage } from './category/list/categories';
// import { Camera, CameraOptions } from '@ionic-native/camera';
// import { StockMoveService } from '../stock/stock-move.service';
// import { CashMoveService } from '../cash/move/cash-move.service';
// import { ConfigService } from '../config/config.service';
import { ActivatedRoute } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  @ViewChild('name') name;
  @ViewChild('price') price;
  @ViewChild('cost') cost;
  @ViewChild('type') type;
  @ViewChild('stock') stock;

    productForm: FormGroup;
    loading: any;
    _id: string;
    languages: Array<LanguageModel>;
    theoreticalStock: number = 0;
    opened: boolean = false;

    constructor(
      public navCtrl: NavController,
      public modal: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      public platform: Platform,
      // public productService: ProductService,
      // public configService: ConfigService,
      public route: ActivatedRoute,
      public pouchdbService: PouchdbService,
      public formBuilder: FormBuilder,
      // public base64: Base64,
      public events:Events,
      // public camera: Camera,
      // public stockMoveService: StockMoveService,
      // public cashMoveService: CashMoveService,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
      if (this.route.snapshot.paramMap.get('_id')){
        this.opened = true;
      }
      // if (this.navParams.data.cost == undefined){
      //   this.navParams.data.cost = '';
      // }
      // if (this.navParams.data.code == undefined){
      //   this.navParams.data.code = '';
      // }
      // if (this.navParams.data.barcode == undefined){
      //   this.navParams.data.barcode = '';
      // }
      // if (this.navParams.data.tax == undefined){
      //   this.navParams.data.tax = '';
      // }
      // if (this.navParams.data.type == undefined){
      //   this.navParams.data.type = '';
      // }
      // if (this.navParams.data.stock == undefined){
      //   this.navParams.data.stock = '';
      // }
      // if (this.navParams.data.stock_min == undefined){
      //   this.navParams.data.stock_min = 0;
      // }
    }

  ngOnInit() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
    this.productForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      image: new FormControl(''),
      price: new FormControl('', Validators.required),
      category: new FormControl({}),
      cost: new FormControl(this.route.snapshot.paramMap.get('cost')),
      code: new FormControl(''),
      barcode: new FormControl(this.route.snapshot.paramMap.get('barcode')),
      tax: new FormControl(this.route.snapshot.paramMap.get('iva')||'iva10'),
      type: new FormControl(this.route.snapshot.paramMap.get('type')),
      stock: new FormControl(this.route.snapshot.paramMap.get('stock')),
      stock_min: new FormControl(this.route.snapshot.paramMap.get('stock_min')),
      note: new FormControl(''),
      date: new FormControl(new Date().toJSON()),
      unity: new FormControl(this.route.snapshot.paramMap.get('unity')||'un'),
      _id: new FormControl(''),
    });
    if (this._id){
      this.getProduct(this._id).then((data) => {
        this.productForm.patchValue(data);
        this.theoreticalStock = data.stock;
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }


    // ionViewDidEnter() {
    //   setTimeout(() => {
    //     this.name.setFocus();
    //   }, 200);
    // }
    //
    // ionViewWillLoad() {
    //
    // }
    //
    // ionViewDidLoad() {
    //   //this.loading.present();
    //   if (this._id){
    //     this.productService.getProduct(this._id).then((data) => {
    //       this.productForm.patchValue(data);
    //       this.theoreticalStock = data.stock;
    //       //this.loading.dismiss();
    //     });
    //   } else {
    //     //this.loading.dismiss();
    //   }
    // }

    goNextStep() {
      // if (this.productForm.value.state == 'DRAFT'){
        if (!this.productForm.value.name){
          this.name.setFocus();
          // return;
        }
        else if (this.productForm.value.price==''){
          this.price.setFocus();
          // return;
        }
        else if (this.productForm.value.cost==''){
          this.cost.setFocus();
          // return;
        }
        else if (!this.productForm.value.type){
          this.type.open();
          // return;
        }
        else if (Object.keys(this.productForm.value.category).length === 0){
          // this.category.setFocus();
          this.selectCategory();

        }
        else if (this.productForm.value.stock.toString()==''){
          // console.l
          this.stock.setFocus();
          // return;
        }
        else if (this.productForm.dirty) {
          this.justSave();
        } else {
          if (this.opened){
            this.navCtrl.navigateBack('').then(() => {
              this.events.publish('open-product', this.productForm.value);
            });
          } else {
            this.navCtrl.navigateBack('').then(() => {
              this.events.publish('create-product', this.productForm.value);
            });
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
      // if (this._id){
      //   this.updateProduct(product).then(doc=>{
      //     this.createInventoryAdjustment();
      //     this.productForm.markAsPristine();
      //   })
      // } else {
      //   this.createProduct(product).then(doc => {
      //     //console.log("docss", doc);
      //     this.productForm.patchValue({
      //       _id: doc['id'],
      //     });
      //     this._id = doc['id'];
      //     this.createInventoryAdjustment();
      //     this.productForm.markAsPristine();
      //   });
      // }
    }

    buttonSave() {
      let product = Object.assign({}, this.productForm.value);
      // if(this.productForm.value.stock != this.theoreticalStock){
        product.stock = this.theoreticalStock;
      // }
      // if (this._id){
      //   this.updateProduct(product).then(doc=>{
      //     this.createInventoryAdjustment();
      //   })
      //   this.navCtrl.navigateBack('/product-list').then(() => {
      //     this.events.publish('open-product', this.productForm.value);
      //   });
      // } else {
      //   this.createProduct(product).then(doc => {
      //     //console.log("docss", doc);
      //     this.productForm.patchValue({
      //       _id: doc['id'],
      //     });
      //     this._id = doc['id'];
      //     this.createInventoryAdjustment();
      //     this.navCtrl.navigateBack('/product-list').then(() => {
      //       this.events.publish('create-product', this.productForm.value);
      //     });
      //   });
      // }
    }

    // createInventoryAdjustment(){
    //   if(this.productForm.value.stock != this.theoreticalStock){
    //     this.configService.getConfigDoc().then((config: any)=>{
    //       let difference = (this.productForm.value.stock - this.theoreticalStock);
    //       let warehouseFrom_id = 'warehouse.inventoryAdjust';
    //       let warehouseTo_id  = config.warehouse_id;
    //       let accountFrom_id = 'account.other.inventoryAdjust';
    //       let accountTo_id  = 'account.other.stock';
    //       if (difference < 0) {
    //         warehouseFrom_id  = config.warehouse_id;
    //         warehouseTo_id = 'warehouse.inventoryAdjust';
    //         accountFrom_id = 'account.other.stock';
    //         accountTo_id  = 'account.other.inventoryAdjust';
    //       }
    //       this.stockMoveService.createStockMove({
    //         'name': "Ajuste "+this.productForm.value.code,
    //         'quantity': Math.abs(difference),
    //         'origin_id': this.productForm.value._id,
    //         'contact_id': "contact.myCompany",
    //         'product_id': this.productForm.value._id,
    //         'date': new Date(),
    //         'cost': this.productForm.value.cost*Math.abs(difference),
    //         'warehouseFrom_id': warehouseFrom_id,
    //         'warehouseTo_id': warehouseTo_id,
    //       }).then(res => {
    //         console.log("res", res);
    //       });
    //
    //       this.cashMoveService.createCashMove({
    //         'name': "Ajuste "+this.productForm.value.code,
    //         'contact_id': "contact.myCompany",
    //         'amount': this.productForm.value.cost*Math.abs(difference),
    //         'origin_id': this.productForm.value._id,
    //         // "project_id": this.productForm.value.project_id,
    //         'date': new Date(),
    //         'accountFrom_id': accountFrom_id,
    //         'accountTo_id': accountTo_id,
    //       }).then((plan: any) => {
    //         //console.log("Plan", plan);
    //         // data['_id'] = plan.id;
    //         // this.saleForm.value.planned.push(data);
    //       })
    //     });
    //   }
    // }

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

    selectCategory() {
        this.events.subscribe('select-category', (data) => {
          this.productForm.patchValue({
            category: data,
          });
          this.productForm.markAsDirty();
          this.events.unsubscribe('select-category');
        })
        this.navCtrl.navigateForward(['product-category-list', {"select": true}]);
    }

    getProduct(doc_id): Promise<any> {
      return new Promise((resolve, reject)=>{
        this.pouchdbService.getDoc(doc_id).then((product: any) => {
          this.pouchdbService.getDoc(product['category_id']).then((category) => {
            product['category'] = category || {};
            this.pouchdbService.getView(
              'stock/Depositos', 2,
              ['0'],
              ['z']
            ).then((viewList: any[]) => {
              let stock = 0;
              viewList.forEach(view=>{
                if (view.key[0].split(".")[1] == 'physical' && view.key[1] == doc_id){
                  stock += view.value;
                }
              })
              product.stock = stock;
              resolve(product);
            });
          });
        });
      });
    }
    getProductByCode(code): Promise<any> {
      return new Promise((resolve, reject)=>{
        this.pouchdbService.getRelated("product", "barcode", code).then((product_list) => {
          let product = product_list[0];
          resolve(product);
        });
      });
    }

    createProduct(viewData){
      return new Promise((resolve, reject)=>{
        let product = Object.assign({}, viewData);
        product.docType = 'product';
        product.price = parseFloat(product.price || 0);
        product.cost = parseFloat(product.cost || 0);
        product.category_id = product.category && product.category._id || product.category_id;
        product.category_name = product.category && product.category.name || product.category_name;
        delete product.category;
        if (product.code != ''){
          resolve(this.pouchdbService.createDoc(product));
        } else {
          // this.configService.getSequence('product').then((code) => {
          //   product['code'] = code;
            resolve(this.pouchdbService.createDoc(product));
          // });
        }
      });
    }

    updateProduct(viewData){
      let product = Object.assign({}, viewData);
      product.docType = 'product';
      product.price = parseFloat(product.price || 0);
      product.cost = parseFloat(product.cost || 0);
      if (product.category){
        product.category_id = product.category._id;
      }
      product.category_name = product.category && product.category.name || product.category_name;
      delete product.category;
      return this.pouchdbService.updateDoc(product);
    }

    deleteProduct(product){
      return this.pouchdbService.deleteDoc(product);
    }

    updateStockAndCost(id, new_stock, new_cost, old_stock, old_cost){
      if (!old_cost){
        old_cost = 0;
      }
      this.pouchdbService.getDoc(id).then((product) => {
        if (old_stock < 0){
          old_stock = 0;
        }
        let current_total_cost = parseFloat(old_stock)*parseFloat(old_cost);
        let new_total_cost = parseFloat(new_stock)*parseFloat(new_cost);
        let new_total_stock = parseFloat(new_stock) + parseFloat(old_stock);
        let newCost = (current_total_cost + new_total_cost)/new_total_stock;
        product['cost'] = newCost;
        this.updateProduct(product);
      });
    }

}
