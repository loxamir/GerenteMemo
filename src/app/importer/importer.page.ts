import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, Events, AlertController } from '@ionic/angular';
import * as papa from 'papaparse';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { ContactService } from '../contact/contact.service';
import { CashMoveService } from '../cash-move/cash-move.service';
import { StockMoveService } from '../stock-move/stock-move.service';
import { FormatService } from '../services/format.service';
import { SaleService } from '../sale/sale.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RestProvider } from "../services/rest/rest";
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";

@Component({
  selector: 'app-importer',
  templateUrl: './importer.page.html',
  styleUrls: ['./importer.page.scss'],
})
export class ImporterPage implements OnInit {
  csvData: any[] = [];
  csvParsed: any[] = [];
  pageProperty: any[] = [];
  pageError: any[] = [];
  headerRow: any[] = [];
  exists = {};
  createList: any = [];
  create: any = {};
  errorMessage: any[] = [];
  validated = false;
  pageSize = 40;
  page = 0;
  error: boolean = true;
  loading: any;
  docType;
  activeField = [];

  constructor(
    public navCtrl: NavController,
    public route: ActivatedRoute,
    public translate: TranslateService,
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public categoryService: ProductCategoryService,
    public contactService: ContactService,
    public cashMoveService: CashMoveService,
    public stockMoveService: StockMoveService,
    public loadingCtrl: LoadingController,
    public languageService: LanguageService,
    public events: Events,
    public alertCtrl: AlertController,
    public formatService: FormatService,
    public saleService: SaleService,
    public restProvider: RestProvider,
  ) {
    this.docType = this.route.snapshot.paramMap.get('docType');
  }

  private extractData(res) {
    let csvData = res; //To run on android
    let parsedData = papa.parse(csvData).data;
    this.headerRow = parsedData[0];
    parsedData.splice(0, 1);
    this.csvParsed = parsedData;
    this.csvData = [];
    this.pageProperty = [];
    this.pageError = [];
    this.page = 1;
    let pageProperty = [];
    let pageError = [];
    let page = 1;
    let counter = 0;
    this.pageProperty[page] = [];
    this.pageError[page] = [];
    this.csvData[page] = [];
    parsedData.forEach((line, index) => {
      if (line.length == parsedData[0].length) {
        counter += 1;
        let colors = [];
        let messages = [];
        for (let i = 0; i < line.length; i++) {
          colors.push('')
          messages.push({ "messages": [] })
        }
        pageProperty.push(colors);
        pageError.push(messages);
        line['line'] = index + 2;
        this.csvData[page].push(line);

        if (counter == this.pageSize) {
          counter = 0;
          this.pageProperty[page] = pageProperty;
          this.pageError[page] = pageError;
          page += 1;
          this.csvData[page] = [];
          pageProperty = [];
          pageError = [];
        }
      }

    });
    if (counter > 0) {
      this.pageProperty[page] = pageProperty;
      this.pageError[page] = pageError;
    }
    this.validated = false;
  }

  nextPage() {
    this.page += 1;
  }

  async editPage() {
    let prompt = await this.alertCtrl.create({
      header: 'Cambiar Pagina',
      message: 'A cual pagina deseas ir?',
      inputs: [
        {
          type: 'number',
          name: 'value',
          value: this.page
        },
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: this.translate.instant('CONFIRM'),
          handler: data => {
            if (data.value > 0 && data.value < this.csvData.length) {
              this.page = parseInt(data.value);
            }
          }
        }
      ]
    });
    prompt.present();
  }

  previousPage() {
    if (this.page > 1) {
      this.page -= 1;
    }
  }

  seeHelp(page, line = null, row = null) {
    this.errorMessage = this.pageError[page][line][row]['messages'];
  }

  validate() {
    this.errorMessage = [];
    let counter = 0;
    this.csvData.forEach(page => {
      counter += 1;
      page.forEach((doc, lines) => {
        if (this.pageError[counter]) {
          for (let i = 0; i < this.pageError[counter].length; i++) {
            this.pageError[counter][lines][i] = { messages: [] };
          }
        }
        if (this.docType == 'product') {
          this.checkExist('product', doc[0], 'code', lines, counter, 0, "Error: Ya existe un Producto con el Codigo '" + doc[0] + "'");
          this.checkExist('product', doc[1], 'name', lines, counter, 1, "Error: Ya existe un Producto con el Nombre '" + doc[1] + "'");
          this.checkDecimal(doc[2], lines, counter, 2);
          this.checkDecimal(doc[3], lines, counter, 3);
          this.checkDecimal(doc[4], lines, counter, 4);
          this.checkTax(doc[5], lines, counter, 5);
          this.checkExist('category', doc[6], 'name', lines, counter, 6, "", "La Categoria '" + doc[6] + "' sera creada", "green", "yellow", true);
          this.checkExist('brand', doc[7], 'name', lines, counter, 7, "", "La Marca '" + doc[7] + "' sera creada", "green", "yellow", true);
          this.checkDecimal(doc[8], lines, counter, 8);
          this.checkType(doc[9], lines, counter, 9);
          this.checkTrue(lines, counter, 10)
          this.checkExist('product', doc[11], 'barcode', lines, counter, 11, "Error: Ya existe un Producto con el Codigo de Barras '" + doc[11] + "'");

        } else if (this.docType == 'contact') {
          this.checkExist('contact', doc[0], 'code', lines, counter, 0, "Error: Ya existe un Contato con el Codigo '" + doc[0] + "'");
          this.checkExist('contact', doc[1], 'name', lines, counter, 1, "Error: Ya existe un Contato con el Nombre '" + doc[1] + "'");
          this.checkTrue(lines, counter, 2) //phone
          this.checkExist('contact', doc[3], 'document', lines, counter, 3, "Error: Ya existe un Contato con el Documento '" + doc[3] + "'");
          this.checkTrue(lines, counter, 4) //address
          this.checkTrue(lines, counter, 5) //email
          this.checkBoolean(doc[6], lines, counter, 6);
          this.checkBoolean(doc[7], lines, counter, 7);
          this.checkBoolean(doc[8], lines, counter, 8);
          this.checkBoolean(doc[9], lines, counter, 9);
          this.checkTrue(lines, counter, 10)
        } else if (this.docType == 'cash-move') {
          this.checkExist('contact', doc[0], 'name', lines, counter, 0, "", "Error: No existe ningun Contato con el Nombre '" + doc[0] + "'", "green", "red");
          this.checkDecimal(doc[1], lines, counter, 1);
          this.checkTrue(lines, counter, 2) //phone
          this.checkDate(doc[3], lines, counter, 3) //date
          this.checkDate(doc[4], lines, counter, 4) //dateDue
          this.checkExist('account', doc[5], 'name', lines, counter, 5, "", "Error: No existe ninguna Cuenta con el Nombre  '" + doc[5] + "'", "green", "red");
          this.checkExist('account', doc[6], 'name', lines, counter, 6, "", "Error: No existe ninguna Cuenta con el Nombre '" + doc[6] + "'", "green", "red");
          this.checkTrue(lines, counter, 7)
        } else if (this.docType == 'sale') {
          this.checkExist('sale', doc[0], 'code', lines, counter, 0, "Error: Ya existe una venta con el Codigo '" + doc[0] + "'");
          this.checkExist('contact', doc[1], 'name', lines, counter, 1, "", "Error: No existe ningun Contato con el Nombre '" + doc[1] + "'", "green", "red");
          this.checkExist('payment-condition', doc[2], 'name', lines, counter, 2, "", "Error: No existe ningun Condición de Pago con el Nombre '" + doc[2] + "'", "green", "red");
          this.checkTrue(lines, counter, 3)
        } else if (this.docType == 'sale-line') {
          this.checkExist('sale', doc[0], 'code', lines, counter, 0, "", "Error: No existe ninguna Venta con el Codigo '" + doc[0] + "'", "green", "red");
          this.checkExist('product', doc[1], 'name', lines, counter, 1, "", "Error: No existe ningun Producto con el Nombre '" + doc[1] + "'", "green", "red");
          this.checkDecimal(doc[2], lines, counter, 2);
          this.checkDecimal(doc[3], lines, counter, 3);
        } else if (this.docType == 'account') {
          this.checkExist('account', doc[0], '_id', lines, counter, 0, "Error: Ya existe una Cuenta con el ID '" + doc[0] + "'");
          this.checkExist('contact', doc[1], 'name', lines, counter, 1, "Error: Ya existe una Cuenta con el Nombre '" + doc[1] + "'");
          this.checkExist('account', doc[2], 'code', lines, counter, 2, "Error: Ya existe un Cuenta con el Codigo '" + doc[2] + "'");
          this.checkExist('accountCategory', doc[3], '_id', lines, counter, 3, "", "La Categoria '" + doc[3] + "' sera creada", "green", "yellow", true);
          this.checkTrue(lines, counter, 4); //type
          this.checkBoolean(doc[5], lines, counter, 5);
          this.checkBoolean(doc[6], lines, counter, 6);
          this.checkBoolean(doc[7], lines, counter, 7);
          this.checkBoolean(doc[8], lines, counter, 8);
          this.checkBoolean(doc[9], lines, counter, 9);
          this.checkTrue(lines, counter, 10); //note
        }
      })
    })
    this.validated = true;
  }

  checkDate(keyword, line, page, row, messageTrue = "", messageFalse = "Formato no reconocido, use el formato '31/12/2018'", ) {
    if (keyword.match(/(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/([12]\d{3})/)) {
      this.pageProperty[page][line][row] = 'green';
      if (messageTrue) {
        this.pageError[page][line][row]['messages'].push(messageTrue);
      }
    } else {
      this.pageProperty[page][line][row] = 'yellow';
      if (messageFalse) {
        this.pageError[page][line][row]['messages'].push(messageFalse);
      }
    }
  }

  checkTrue(line, page, row) {
    this.pageProperty[page][line][row] = 'green';
  }

  checkBoolean(keyword, line, page, row, messageTrue = "", messageFalse = "Formato no reconocido, use '1' para Si y '0' para No", colorTrue = 'green', colorFalse = 'red') {
    if (keyword == '1' || keyword == '0' || keyword == 'TRUE' || keyword == 1 || keyword == 'FALSE' || keyword == 0) {
      this.pageProperty[page][line][row] = colorTrue;
      if (messageTrue) {
        this.pageError[page][line][row]['messages'].push(messageTrue);
      }
    } else {
      this.pageProperty[page][line][row] = colorFalse;
      if (messageFalse) {
        this.pageError[page][line][row]['messages'].push(messageFalse);
      }
    }
  }

  checkTax(keyword, line, page, row, messageTrue = "", messageFalse = "El Impuesto es invalido, use 'iva10', 'iva5' o 'iva0'", colorTrue = 'green', colorFalse = 'red') {
    if (keyword == 'iva10' || keyword == 'iva5' || keyword == 'iva0') {
      this.pageProperty[page][line][row] = colorTrue;
      if (messageTrue) {
        this.pageError[page][line][row]['messages'].push(messageTrue);
      }
    } else {
      this.pageProperty[page][line][row] = colorFalse;
      if (messageFalse) {
        this.pageError[page][line][row]['messages'].push(messageFalse);
      }
    }
  }

  checkType(keyword, line, page, row, messageTrue = "", messageFalse = "El Tipo es invalido, use 'product', 'service' o 'consumible'", colorTrue = 'green', colorFalse = 'red') {
    if (keyword == 'product' || keyword == 'service' || keyword == 'consumible') {
      this.pageProperty[page][line][row] = colorTrue;
      if (messageTrue) {
        this.pageError[page][line][row]['messages'].push(messageTrue);
      }
    } else {
      this.pageProperty[page][line][row] = colorFalse;
      if (messageFalse) {
        this.pageError[page][line][row]['messages'].push(messageFalse);
      }
    }
  }

  checkDecimal(keyword, line, page, row, messageTrue = "", messageFalse = "Formato no valido, utilize el formato '1234.00' o '1234'", colorTrue = 'green', colorFalse = 'red') {
    if (!isNaN(keyword)) {
      this.pageProperty[page][line][row] = colorTrue;
      if (messageTrue) {
        this.pageError[page][line][row]['messages'].push(messageTrue);
      }
    } else {
      this.pageProperty[page][line][row] = colorFalse;
      if (messageFalse) {
        this.pageError[page][line][row]['messages'].push(messageFalse);
      }
    }
  }

  checkExist(docType, keyword, field, line, page, row, messageTrue = "", messageFalse = "", colorTrue = 'red', colorFalse = 'green', create = false) {
    if (keyword == '') {
      this.pageProperty[page][line][row] = colorFalse;
    } else {
      this.pouchdbService.searchDocField(docType, keyword, field).then((doca: any[]) => {
        if (doca.length != 0) {
          this.pageProperty[page][line][row] = colorTrue;
          if (messageTrue) {
            this.pageError[page][line][row]['messages'].push(messageTrue);
          }
        } else {
          this.pageProperty[page][line][row] = colorFalse;
          if (messageFalse) {
            this.pageError[page][line][row]['messages'].push(messageFalse);
          }
          if (create) {
            let data = {
              docType: docType,
              name: keyword,
            }
            if (this.createList.findIndex(i => i.name === keyword) == -1) {
              this.createList.push(data);
            }
          }
        }
      });
    }
  }

  async import() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    if (this.docType == 'product') {
      let promise_ids = [];
      this.createList.forEach(data => {
        if (data.docType == 'category') {
          promise_ids.push(this.categoryService.createCategory({
            "name": data.name,
          }, false))
        }
        else if (data.docType == 'brand') {
          promise_ids.push(this.pouchdbService.createDoc({
            "name": data.name,
            "docType": 'brand'
          }))
        }
      })
      Promise.all(promise_ids).then(categories => {
        this.formatProducts(this.csvParsed).then(async (csv: any[]) => {
          let bigger_code: any = 0;
          let promise2_ids = [];
          let count = 1;
          await this.formatService.asyncForEach(csv, async (item: any) => {
            count += 1;
            if (parseInt(item.code) > bigger_code) {
              bigger_code = item.code;
            }
            let createdProduct = await this.productService.createProduct(item);
            item._id = createdProduct['id'];
            await this.stockMoveService.createInventoryAdjustment(item, item.stock);
          })
          this.pouchdbService.getDoc('sequence.product').then(async (productSequence: any) => {
            if (parseInt(productSequence.value) < (parseInt(bigger_code) + 1)) {
              bigger_code = bigger_code.toString();
              let regex = /[0-9]+$/
              let string_end = bigger_code.match(regex).index;
              let number = bigger_code.match(regex)[0];
              let next_number = parseFloat(number) + 1;
              let prefix = bigger_code.substr(0, string_end);
              let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
              let new_code = prefix + pad_number;
              productSequence.value = new_code;
              this.pouchdbService.updateDoc(productSequence);
            }
            this.loading.dismiss();
            this.navCtrl.navigateBack('/product-list');
            const alert = await this.alertCtrl.create({
              header: 'Importación Exitosa!',
              message: 'Tus Productos han sido importados con exito!',
              buttons: ['OK, Gracias']
            });
            alert.present();
          })
        })
      })
    } else if (this.docType == 'contact') {
      this.formatContacts(this.csvParsed).then(async (csv: any[]) => {
        let bigger_code: any = 0;
        let count = 1;
        let promise2_ids = [];
        await this.formatService.asyncForEach(csv, async (item: any) => {
          count += 1;
          if (item.document) {
            if (item.document[item.document.length - 2] == '-') {
              let data: any = await this.restProvider.getRucName(item.document);
              if (data.name != 'HttpErrorResponse') {
                item.name_legal = data.name;
              }
            }
          }
          if (parseInt(item.code) > bigger_code) {
            bigger_code = item.code;
          }
          promise2_ids.push(this.contactService.createContact(item));
        })
        Promise.all(promise2_ids).then(async contacts => {
          this.pouchdbService.getDoc('sequence.contact').then(async (contactSequence: any) => {
            if (parseInt(contactSequence.value) < (parseInt(bigger_code) + 1)) {
              bigger_code = bigger_code.toString();
              let regex = /[0-9]+$/
              let string_end = bigger_code.match(regex).index;
              let number = bigger_code.match(regex)[0];
              let next_number = parseFloat(number) + 1;
              let prefix = bigger_code.substr(0, string_end);
              let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
              let new_code = prefix + pad_number;
              contactSequence.value = new_code;
              this.pouchdbService.updateDoc(contactSequence);
            }
            this.loading.dismiss();
            this.navCtrl.navigateBack('/contact-list');
            const alert = await this.alertCtrl.create({
              header: 'Importación Exitosa!',
              message: 'Tus Contatos han sido importados con exito!',
              buttons: ['OK, Gracias']
            });
            alert.present();
          })
        })
      })
    } else if (this.docType == 'cash-move') {
      this.formatCashMoves(this.csvParsed).then(async (csv: any[]) => {
        let bigger_code: any = 0;
        let count = 1;
        let promise2_ids = [];
        await this.formatService.asyncForEach(csv, async (item: any) => {
          count += 1;
          if (parseInt(item.code) > bigger_code) {
            bigger_code = item.code;
          }
          promise2_ids.push(this.cashMoveService.createCashMove(item));
        })
        Promise.all(promise2_ids).then(async contacts => {
          this.pouchdbService.getDoc('config.profile').then((config: any) => {
            if (parseInt(config.cash_move_sequence) < (parseInt(bigger_code) + 1)) {
              bigger_code = bigger_code.toString();
              let regex = /[0-9]+$/
              let string_end = bigger_code.match(regex).index;
              let number = bigger_code.match(regex)[0];
              let next_number = parseFloat(number) + 1;
              let prefix = bigger_code.substr(0, string_end);
              let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
              let new_code = prefix + pad_number;
              config.cash_move_sequence = new_code;
              this.pouchdbService.updateDoc(config);
            }
          })
          this.loading.dismiss();
          this.events.publish('import-cash-move');
          this.navCtrl.navigateBack('/tabs/cash-list');
          const alert = await this.alertCtrl.create({
            header: 'Importación Exitosa!',
            message: 'Tus Cuentas han sido importados con exito!',
            buttons: ['OK, Gracias']
          });
          alert.present();
        })
      })
    } else if (this.docType == 'sale') {
      this.formatSales(this.csvParsed).then(async (csv: any[]) => {
        let bigger_code: any = 0;
        let promise2_ids = [];
        let count = 1;
        await this.formatService.asyncForEach(csv, async (item: any) => {
          count += 1;
          if (parseInt(item.code) > bigger_code) {
            bigger_code = item.code;
          }
          promise2_ids.push(this.saleService.createSale(item));
        })
        Promise.all(promise2_ids).then(async sales => {
          this.pouchdbService.getDoc('config.profile').then((config: any) => {
            if (parseInt(config.sale_sequence) < (parseInt(bigger_code) + 1)) {
              bigger_code = bigger_code.toString();
              let regex = /[0-9]+$/
              let string_end = bigger_code.match(regex).index;
              let number = bigger_code.match(regex)[0];
              let next_number = parseFloat(number) + 1;
              let prefix = bigger_code.substr(0, string_end);
              let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
              let new_code = prefix + pad_number;
              config.sale_sequence = new_code;
              this.pouchdbService.updateDoc(config);
            }
          })
          // bigger_code
          this.loading.dismiss();
          this.navCtrl.navigateBack('/tabs/sale-list');
          const alert = await this.alertCtrl.create({
            header: 'Importación Exitosa!',
            message: 'Tus Ventas han sido importadas con exito!',
            buttons: ['OK, Gracias']
          });
          alert.present();
          this.events.publish('import-sale');
        })
      })
    } else if (this.docType == 'sale-line') {
      this.formatSaleLines(this.csvParsed).then(async (csv: any[]) => {
        let promise2_ids = [];
        await this.formatService.asyncForEach(Object.keys(csv), async (key: any) => {
          promise2_ids.push(this.saleService.getSale('sale.' + key).then(doc => {
            doc.lines = csv[key]['items'];
            doc.total = csv[key]['total'];
            this.saleService.updateSaleMigrated(doc);
          }))
        })
        Promise.all(promise2_ids).then(async data => {
          this.events.publish('import-sale');
          this.loading.dismiss();
          this.navCtrl.navigateBack('/tabs/sale-list');
          const alert = await this.alertCtrl.create({
            header: 'Importación Exitosa!',
            message: 'Tus Lineas de Ventas han sido importadas con exito!',
            buttons: ['OK, Gracias']
          });
          alert.present();
        })
      })
    } else if (this.docType == 'account') {
      this.formatAccounts(this.csvParsed).then(async (csv: any[]) => {
        let count = 1;
        let promise2_ids = [];
        await this.formatService.asyncForEach(csv, async (item: any) => {
          count += 1;
          promise2_ids.push(this.pouchdbService.createDoc(item));

        })
        Promise.all(promise2_ids).then(async contacts => {
          this.loading.dismiss();
          this.navCtrl.navigateBack('/account-list');
          const alert = await this.alertCtrl.create({
            header: 'Importación Exitosa!',
            message: 'Tus Cuentas han sido importadas con exito!',
            buttons: ['OK, Gracias']
          });
          alert.present();
        })
      })
    }
  }

  formatProducts(arr) {
    return new Promise((resolve, reject) => {
      let self = this;
      let code,
        name,
        price,
        cost,
        stock,
        tax,
        category_id,
        brand_id,
        stock_min,
        type,
        note,
        barcode,
        obj = [];
      let promise_ids = [];
      let docs = [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].length == arr[0].length) {
          var items = arr[j];
          docs.push(items);
          promise_ids.push(this.pouchdbService.searchDocField('category', items[6]));
          promise_ids.push(this.pouchdbService.searchDocField('brand', items[7]));
        }
      }
      Promise.all(promise_ids).then(categories => {
        var doc_dict = {};
        categories.forEach(row => {
          doc_dict[row[0].docType + ':' + row[0].name] = row[0];
        })
        docs.forEach((doc, index) => {
          let value = categories[index];
          obj.push({
            code: doc[0],
            name: doc[1],
            price: doc[2],
            cost: doc[3],
            stock: doc[4],
            tax: doc[5],
            category_id: doc_dict['category:' + doc[6]]._id,
            category_name: doc_dict['category:' + doc[6]].name,
            brand_id: doc_dict['brand:' + doc[7]]._id,
            brand_name: doc_dict['brand:' + doc[7]].name,
            stock_min: doc[8],
            type: doc[9],
            note: doc[10],
            barcode: doc[11],
          });
        })
        resolve(obj);
      })
    });
  }

  formatContacts(arr) {
    return new Promise((resolve, reject) => {
      let code,
        name,
        document,
        phone,
        address,
        email,
        customer,
        supplier,
        employee,
        seller,
        note,
        obj = [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].length == arr[0].length) {
          var items = arr[j];
          obj.push({
            code: items[0],
            name: items[1],
            phone: items[2],
            document: items[3],
            address: items[4],
            email: items[5],
            customer: this.resolveBoolean(items[6]),
            supplier: this.resolveBoolean(items[7]),
            employee: this.resolveBoolean(items[8]),
            seller: this.resolveBoolean(items[9]),
            note: items[10],
          });
        }
      }
      resolve(obj);
    });
  }

  formatAccounts(arr) {
    return new Promise((resolve, reject) => {
      let code,
        name,
        document,
        phone,
        address,
        email,
        customer,
        supplier,
        employee,
        seller,
        note,
        obj = [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].length == arr[0].length) {
          var items = arr[j];
          obj.push({
            _id: items[0],
            name: items[1],
            code: items[2],
            category_id: items[3],
            type: items[4],
            cash_out: this.resolveBoolean(items[5]),
            cash_in: this.resolveBoolean(items[6]),
            transfer: this.resolveBoolean(items[7]),
            payable: this.resolveBoolean(items[8]),
            receivable: this.resolveBoolean(items[9]),
            note: items[10],
          });
        }
      }
      resolve(obj);
    });
  }

  formatCashMoves(arr) {
    return new Promise((resolve, reject) => {
      let contact_id,
        amount,
        origin_id,
        date,
        dateDue,
        note,
        accountFrom_id,
        accountTo_id,
        obj = [];
      let promise_ids = [];
      let docs = [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].length == arr[0].length) {
          var items = arr[j];
          items[3] = new Date(items[3].split("/")[1] + "-" + items[3].split("/")[0] + "-" + items[3].split("/")[2]).toISOString();
          items[4] = new Date(items[4].split("/")[1] + "-" + items[4].split("/")[0] + "-" + items[4].split("/")[2]).toISOString();
          docs.push(items);
          promise_ids.push(this.pouchdbService.searchDocField('contact', items[0]));
          promise_ids.push(this.pouchdbService.searchDocField('account', items[5]));
          promise_ids.push(this.pouchdbService.searchDocField('account', items[6]));
        }
      }
      Promise.all(promise_ids).then(contacts => {
        let counter = 0;
        docs.forEach((doc, index) => {
          obj.push({
            contact_id: contacts[counter][0]._id,
            amount: parseFloat(doc[1].replace(".000", "000")),
            amount_unInvoiced: parseFloat(doc[1].replace(".000", "000")),
            origin_id: doc[2],
            date: doc[3],
            dateDue: doc[4],
            name: doc[2],
            accountFrom_id: contacts[counter + 1][0]._id,
            accountFrom_name: contacts[counter + 1][0].name,
            accountTo_id: contacts[counter + 2][0]._id,
            accountTo_name: contacts[counter + 2][0].name,
            note: doc[7],
          });
          counter += 3;
        })
        resolve(obj);
      })
    });
  }

  formatSales(arr) {
    return new Promise((resolve, reject) => {
      let contact_id,
        amount,
        origin_id,
        date,
        dateDue,
        note,
        accountFrom_id,
        accountTo_id,
        obj = [];
      let promise_ids = [];
      let docs = [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].length == arr[0].length) {
          var items = arr[j];
          docs.push(items);
          promise_ids.push(this.pouchdbService.searchDocField('contact', items[1]));
          promise_ids.push(this.pouchdbService.searchDocField('payment-condition', items[2]));
        }
      }
      Promise.all(promise_ids).then(contacts => {
        let counter = 0;
        docs.forEach((doc, index) => {
          obj.push({
            code: doc[0],
            contact_name: doc[1],
            contact_id: contacts[counter][0]._id,
            contact: contacts[counter][0],
            payment_name: doc[2],
            pay_cond_id: contacts[counter + 1][0]._id,
            paymentCondition: contacts[counter + 1][0],
            project: {},
            date: doc[3],
            name: "Venta Importada " + doc[0],
            residual: 0,
            total: 0,
            state: "PAID",
            amount_unInvoiced: 0,
            seller: {},
            seller_name: "",
            items: [],
          });
          counter += 2;
        })
        resolve(obj);
      })
    });
  }

  formatSaleLines(arr) {
    return new Promise((resolve, reject) => {
      let contact_id,
        amount,
        origin_id,
        date,
        dateDue,
        note,
        accountFrom_id,
        accountTo_id,
        obj = [];
      let promise_ids = [];
      let docs = [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].length == arr[0].length) {
          var items = arr[j];
          docs.push(items);
          promise_ids.push(this.pouchdbService.searchDocField('product', items[1]));
        }
      }
      Promise.all(promise_ids).then(contacts => {
        let sales = {};
        let counter = 0;
        docs.forEach((doc, index) => {
          if (sales.hasOwnProperty(doc[0])) {
            sales[doc[0]]['items'].push({
              'product_id': contacts[counter][0]._id,
              'quantity': parseFloat(doc[3]),
              'price': parseFloat(doc[2]),
              'cost': contacts[counter][0].cost,
            })
            sales[doc[0]]['total'] += parseFloat(doc[2]) * parseFloat(doc[3]);
          } else {
            sales[doc[0]] = {
              'items': [{
                'product_id': contacts[counter][0]._id,
                'quantity': parseFloat(doc[3]),
                'price': parseFloat(doc[2]),
                'cost': contacts[counter][0].cost,
              }],
              'total': parseFloat(doc[2]) * parseFloat(doc[3]),
            }
          }
          counter += 1;
        })
        resolve(sales);
      })
    });
  }

  resolveBoolean(value) {
    if (value == 1
      || value == 'TRUE'
      || value == '1'
      || value == true
    ) {
      return true;
    } else if (
      value == ''
      || value == '0'
      || value == 0
      || value == 'FALSE'
      || value == false
    ) {
      return false;
    } else {
      return true;
    }
  }

  downloadCSV() {
    let csv = papa.unparse({
      fields: this.headerRow,
      data: this.csvData
    });

    // Dummy implementation for Desktop download purpose
    var blob = new Blob([csv]);
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "newdata.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private handleError(err) {
    console.log('something went wrong: ', err);
  }

  async ngOnInit() {
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }

  public changeListener(files: FileList) {
    if (files && files.length > 0) {
      let file: File = files.item(0);
      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        let csv = reader.result;
        this.extractData(csv);
      }
    }
  }

}
