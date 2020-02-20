import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Platform } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProductService } from './product.service';
import { ConfigService } from '../config/config.service';
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
    barcode = '';
    editMode = false;
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
      public configService: ConfigService,
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
      this.barcode = this.route.snapshot.paramMap.get('barcode');
      this.cost = this.route.snapshot.paramMap.get('cost');
      this.stock = this.route.snapshot.paramMap.get('stock');
    }

    enableEditMode(){
      this.editMode = !this.editMode;
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
        barcode: new FormControl(this.barcode),
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
        this.editMode = true;
        this.getDefaultCategory();
        this.loading.dismiss();
      }
    }

    getBase64Image(imgUrl, callback) {
      var img = new Image();
      // onload fires when the image is fully loadded, and has width and height
      img.onload = function(){
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png"),
            dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        callback(dataURL); // the base64 string
      };
      // set attributes and src
      img.setAttribute('crossOrigin', 'anonymous'); //
      img.src = imgUrl;
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

    async authLogin() {
      let profileModal = await this.modalCtrl.create({
        component: LoginPage,
        componentProps: {}
      })
      profileModal.present();
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
          this.navCtrl.navigateBack('/product-list');
          // .then(() => {
            this.events.publish('open-product', {product: this.productForm.value});
          // });
        } else {
          this.navCtrl.navigateBack('/product-list');
          // .then(() => {
            this.events.publish('create-product', {product: this.productForm.value});
          // });
        }
      }
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
      this.productForm.patchValue({
          stock: parseFloat(this.productForm.value.stock) || 0,
          cost: parseFloat(this.productForm.value.cost) || 0,
          price: parseFloat(this.productForm.value.price) || 0,
          stock_min: parseFloat(this.productForm.value.stock_min) || 0,
      })

      let product = Object.assign({}, this.productForm.value);
      // console.log("product", product);
      // if(this.productForm.value.stock != this.theoreticalStock){
        product.stock = this.theoreticalStock;
      // }
      if (this._id){
        this.productService.updateProduct(product, this.avatar).then(doc=>{
          this.createInventoryAdjustment();
        })
        if (this.select){
          this.modalCtrl.dismiss();
          this.events.publish('open-product', {product: this.productForm.value});
        } else {
          this.navCtrl.navigateBack('/product-list');
          // .then(() => {
            this.events.publish('open-product', {product: this.productForm.value});
          // });
        }
      } else {
          //console.log("docss", doc);
        this.productService.createProduct(product, this.avatar).then(async (doc: any) => {
          let produ:any = await this.pouchdbService.getDoc(doc['id'])
          this.productForm.patchValue({
            _id: doc['id'],
            code: produ.code
          });
          this._id = doc['id'];
          this.createInventoryAdjustment();
          if (this.select){
            this.modalCtrl.dismiss();
            this.events.publish('create-product', {product: this.productForm.value});
          } else {
            this.navCtrl.navigateBack('/product-list');
            // .then(() => {
              this.events.publish('create-product', {product: this.productForm.value});
            // });
          }
        });
      }
    }

    createInventoryAdjustment(){
      if(this.productForm.value.stock != this.theoreticalStock){
        this.configService.getConfigDoc().then(async (config: any)=>{
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
          let docs: any = await this.pouchdbService.getList([
            warehouseFrom_id,
            warehouseTo_id,
            accountFrom_id,
            accountTo_id,
          ]);
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc.name;
          })

          this.createCashMove({
            'docType': "cash-move",
            'name': "Ajuste "+this.productForm.value.code,
            'contact_id': "contact.myCompany",
            'contact_name': config.name,
            'amount': (parseFloat(this.productForm.value.cost)||0)*Math.abs(difference),
            'origin_id': this.productForm.value._id,
            // "project_id": this.productForm.value.project_id,
            'date': new Date(),
            'accountFrom_id': accountFrom_id,
            'accountFrom_name': doc_dict[accountFrom_id],
            'accountTo_id': accountTo_id,
            'accountTo_name': doc_dict[accountTo_id],
          }).then((plan: any) => {
            //console.log("Plan", plan);
            // data['_id'] = plan.id;
          })
        });
      }
    }


    async createCashMove(viewData){
      let cash = Object.assign({}, viewData);
      cash.amount = cash.amount || 0;
      cash.docType = 'cash-move';
      if (viewData.accountTo_id.split(".")[1] == 'receivable'){
        cash.amount_residual = parseFloat(cash.amount);
        if (! cash.payments){
          cash.payments = [];
        }
        if (! cash.amount_unInvoiced){
          cash.amount_unInvoiced = cash.amount;
        }
        if (! cash.invoices){
          cash.invoices = [];
        }
        cash.amount_residual = parseFloat(cash.amount);
      } else if (viewData.accountFrom_id.split(".")[1] == 'payable'){
        cash.amount_residual = parseFloat(cash.amount);
        if (! cash.payments){
          cash.payments = [];
        }
        if (! cash.amount_unInvoiced){
          cash.amount_unInvoiced = cash.amount;
        }
        if (! cash.invoices){
          cash.invoices = [];
        }
      } else {
        delete cash.amount_residual;
        delete cash.payments;
      }
      let docs: any = await this.pouchdbService.getList([
        cash.accountFrom_id,
        cash.accountTo_id,
        cash.contact_id,
      ]);
      let docDict = {}
      docs.forEach(item=>{
        docDict[item.id] = item;
      })
      // console.log("docs", docDict);
      // console.log("cash", cash);

      if (cash.contact){
        cash.contact_name = cash.contact.name;
      } else {
        if (!cash.contact_id){
          cash.contact_id = 'contact.unknown';
        }
        cash.contact_name = docDict[cash.contact_id].doc.name;
      }
      if (cash.accountFrom){
        cash.accountFrom_name = cash.accountFrom.name;
      } else {
        // console.log("docDict[cash.accountFrom_id]", docDict[cash.accountFrom_id])
        cash.accountFrom_name = docDict[cash.accountFrom_id].doc.name;
      }
      if (cash.accountTo){
        cash.accountTo_name = cash.accountTo.name;
      } else {
        cash.accountTo_name = docDict[cash.accountTo_id].doc.name;
      }
      return new Promise((resolve, reject)=>{
        // this.configService.getSequence('cash_move').then((code) => {
          // cash['code'] = code;
          // cash['code'] = this.formatService.string_pad(4, code, "right", "0");
          if (!cash.origin_id){
            cash.origin_id = "M"+Date.now();
          }
          cash.amount = parseFloat(cash.amount);
          delete cash.cash;
          delete cash.contact;
          delete cash.project;
          delete cash.accountTo;
          delete cash.accountFrom;
          cash.currency_id = cash.currency && cash.currency._id || cash.currency_id || '';
          cash.check_id = cash.check && cash.check._id || cash.check_id || '';
          delete cash.currency;
          delete cash.check;
          return this.pouchdbService.createDoc(cash).then((data: any) => {
            cash.id = data.id;
            resolve(cash);
          })
        // });
      });
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
