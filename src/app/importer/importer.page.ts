import { Component, OnInit } from '@angular/core';
import { NavController,  LoadingController, Events, AlertController } from '@ionic/angular';
import * as papa from 'papaparse';
import { Http } from '@angular/http';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
// import { File } from '@ionic-native/file';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { ContactService } from '../contact/contact.service';
import { CashMoveService } from '../cash-move/cash-move.service';
import { FormatService } from '../services/format.service';
import { SaleService } from '../sale/sale.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-importer',
  templateUrl: './importer.page.html',
  styleUrls: ['./importer.page.scss'],
})
export class ImporterPage implements OnInit {
  csvData: any[] = [];
  csvProperty: any[] = [];
  headerRow: any[] = [];
  exists = {};
  createList: any = [];
  create: any = {};
  errorMessage: any[] = [];
  csvError: any[] = [];
  // createList: any[] = [];
  error: boolean = true;
  loading: any;
  docType;

  constructor(
    public navCtrl: NavController,
    public route: ActivatedRoute,
    public http: Http,
    public fileChooser: FileChooser,
    public filePath: FilePath,
    // public file: File,
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public categoryService: ProductCategoryService,
    public contactService: ContactService,
    public cashMoveService: CashMoveService,
    public loadingCtrl: LoadingController,
    public events: Events,
    public alertCtrl: AlertController,
    public formatService: FormatService,
    public saleService: SaleService,
  ) {
    // this.readCsvData(); //To run on browser
    this.docType = this.route.snapshot.paramMap.get('docType');
    //this.loading = //this.loadingCtrl.create();
  }

  private readCsvData() {
    let file = "";
    if (this.docType == 'sale'){
      file = 'assets/ventas.csv';
    } else if (this.docType == 'contact'){
      file = 'assets/contacts.csv';
    } else if (this.docType == 'product'){
      file = 'assets/products.csv';
    } else if (this.docType == 'cash-move'){
      file = 'assets/contas.csv';
    } else if (this.docType == 'sale-line'){
      file = 'assets/lines.csv';
    }
    this.http.get(file)
      .subscribe(
      data => this.extractData(data['_body']),
      err => this.handleError(err)
      );
  }

  private extractData(res) {
    console.log("RES", JSON.stringify(res));
    // let csvData = res['_body'] || ''; //To run on browser
    let csvData = res; //To run on android
    let parsedData = papa.parse(csvData).data;
    console.log("parsedata1", parsedData);
    this.headerRow = parsedData[0];

    parsedData.splice(0, 1);
    let parse2 = parsedData.slice(0, -1);
    console.log("parsedata2", parse2);
    parse2.forEach((line, index)=>{
      let colors = [];
      let messages = [];
      for(let i=0;i<line.length;i++){
        colors.push('')
        messages.push({"messages": []})
      }
      this.csvProperty.push(colors);
      this.csvError.push(messages);
    });
    this.csvData = parse2;
  }
  seeHelp(line=null, row=null){
    console.log("line", line,"row", row);
    this.errorMessage = this.csvError[line][row]['messages'];
  }

  validate(){
    console.log("Validate", this.csvData);
    this.errorMessage = [];
    this.csvData.forEach((doc, lines)=>{
      for(let i=0;i<this.csvError.length;i++){
        this.csvError[lines][i] = {messages: []};
      }
      if (this.docType == 'product'){
        this.checkExist('product', doc[0], 'code', lines, 0, "Error: Ya existe un Producto con el Codigo '"+doc[0]+"'");
        this.checkExist('product', doc[1], 'name', lines, 1, "Error: Ya existe un Producto con el Nombre '"+doc[1]+"'");
        this.checkDecimal(doc[2], lines, 2);
        this.checkDecimal(doc[3], lines, 3);
        this.checkDecimal(doc[4], lines, 4);
        this.checkTax(doc[5], lines, 5);
        this.checkExist('category', doc[6], 'name', lines, 6, "", "La Categoria '"+doc[6]+"' sera creada", "green", "yellow", true);
        this.checkDecimal(doc[7], lines, 7);
        this.checkType(doc[8], lines, 8);
        this.checkType(doc[8], lines, 8);
        this.checkTrue(lines, 9)
      } else if (this.docType == 'contact'){
        this.checkExist('contact', doc[0], 'code', lines, 0, "Error: Ya existe un Contato con el Codigo '"+doc[0]+"'");
        this.checkExist('contact', doc[1], 'name', lines, 1, "Error: Ya existe un Contato con el Nombre '"+doc[1]+"'");
        this.checkTrue(lines, 2) //phone
        this.checkExist('contact', doc[3], 'document', lines, 3, "Error: Ya existe un Contato con el Documento '"+doc[3]+"'");
        this.checkTrue(lines, 4) //address
        this.checkTrue(lines, 5) //email
        this.checkBoolean(doc[6], lines, 6);
        this.checkBoolean(doc[7], lines, 7);
        this.checkBoolean(doc[8], lines, 8);
        this.checkBoolean(doc[9], lines, 9);
        this.checkTrue(lines, 10)
      } else if (this.docType == 'cash-move'){
        this.checkExist('contact', doc[0], 'name', lines, 0, "", "Error: No existe ningun Contato con el Nombre '"+doc[0]+"'", "green", "red");
        this.checkDecimal(doc[1], lines, 1);
        this.checkTrue(lines, 2) //phone
        this.checkDate(doc[3], lines, 3) //date
        this.checkDate(doc[4], lines, 4) //dateDue
        this.checkExist('account', doc[5], 'name', lines, 5, "", "Error: No existe ninguna Cuenta con el Nombre  '"+doc[5]+"'", "green", "red");
        this.checkExist('account', doc[6], 'name', lines, 6, "", "Error: No existe ninguna Cuenta con el Nombre '"+doc[6]+"'", "green", "red");
        this.checkTrue(lines, 7)
      } else if (this.docType == 'sale'){
        this.checkExist('sale', doc[0], 'code', lines, 0, "Error: Ya existe una venta con el Codigo '"+doc[0]+"'");
        this.checkExist('contact', doc[1], 'name', lines, 1, "", "Error: No existe ningun Contato con el Nombre '"+doc[1]+"'", "green", "red");
        // this.checkExist('contact', doc[1], 'name', lines, 1, "Error: Ya existe un contato con el Nombre '"+doc[1]+"'");
        this.checkExist('payment-condition', doc[2], 'name', lines, 2, "", "Error: No existe ningun Condición de Pago con el Nombre '"+doc[2]+"'", "green", "red");
        // this.checkTrue(lines, 2) //phone
        // this.checkExist('contact', doc[3], 'document', lines, 3, "Error: Ya existe un Contato con el Documento '"+doc[3]+"'");
        // this.checkTrue(lines, 4) //address
        // this.checkTrue(lines, 5) //email
        // this.checkBoolean(doc[6], lines, 6);
        // this.checkBoolean(doc[7], lines, 7);
        // this.checkBoolean(doc[8], lines, 8);
        // this.checkBoolean(doc[9], lines, 9);
        this.checkTrue(lines, 3)
      } else if (this.docType == 'sale-line'){
        this.checkExist('sale', doc[0], 'code', lines, 0, "", "Error: No existe ninguna Venta con el Codigo '"+doc[0]+"'", "green", "red");
        // this.checkExist('sale', doc[0], 'code', lines, 0, "Error: Ya existe una venta con el Codigo '"+doc[0]+"'");
        this.checkExist('product', doc[1], 'name', lines, 1, "", "Error: No existe ningun Producto con el Nombre '"+doc[1]+"'", "green", "red");
        // this.checkExist('contact', doc[1], 'name', lines, 1, "Error: Ya existe un contato con el Nombre '"+doc[1]+"'");
        this.checkDecimal(doc[2], lines, 2);
        this.checkDecimal(doc[3], lines, 3);
        // this.checkExist('payment-condition', doc[2], 'name', lines, 2, "", "Error: No existe ningun Condición de Pago con el Nombre '"+doc[2]+"'", "green", "red");
        // this.checkTrue(lines, 2) //phone
        // this.checkExist('contact', doc[3], 'document', lines, 3, "Error: Ya existe un Contato con el Documento '"+doc[3]+"'");
        // this.checkTrue(lines, 4) //address
        // this.checkTrue(lines, 5) //email
        // this.checkBoolean(doc[6], lines, 6);
        // this.checkBoolean(doc[7], lines, 7);
        // this.checkBoolean(doc[9], lines, 9);
        // this.checkTrue(lines, 3)
      }
    })
  }

  checkDate(keyword, line, row, messageTrue="", messageFalse="Formato no reconocido, use el formato '31/12/2018'",){
    // regex() /(0[1-9]|[12]\d|3[01])/(0[1-9]|1[0-2])/([12]\d{3})/
    if (keyword.match(/(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/([12]\d{3})/)){
      this.csvProperty[line][row] = 'green';
      if (messageTrue){
        this.csvError[line][row]['messages'].push(messageTrue);
      }
    } else {
      this.csvProperty[line][row] = 'yellow';
      if (messageFalse){
        this.csvError[line][row]['messages'].push(messageFalse);
      }
    }
  }

  checkTrue(line, row){
    this.csvProperty[line][row] = 'green';
  }

  checkBoolean(keyword, line, row, messageTrue="", messageFalse="Formato no reconocido, use '1' para Si y '0' para No", colorTrue='green', colorFalse='red'){
    if(keyword == '1' || keyword == '0' || keyword == ''){
      this.csvProperty[line][row] = colorTrue;
      if (messageTrue){
        this.csvError[line][row]['messages'].push(messageTrue);
      }
    } else {
      this.csvProperty[line][row] = colorFalse;
      if (messageFalse){
        this.csvError[line][row]['messages'].push(messageFalse);
      }
    }
  }

  checkTax(keyword, line, row, messageTrue="", messageFalse="El Impuesto es invalido, use 'iva10', 'iva5' o 'iva0'", colorTrue='green', colorFalse='red'){
      if(keyword == 'iva10' || keyword == 'iva5' || keyword == 'iva0'){
        this.csvProperty[line][row] = colorTrue;
        if (messageTrue){
          this.csvError[line][row]['messages'].push(messageTrue);
        }
      } else {
        this.csvProperty[line][row] = colorFalse;
        if (messageFalse){
          this.csvError[line][row]['messages'].push(messageFalse);
        }
      }
  }

  checkType(keyword, line, row, messageTrue="", messageFalse="El Tipo es invalido, use 'product', 'service' o 'consumible'", colorTrue='green', colorFalse='red'){
      if(keyword == 'product' || keyword == 'service' || keyword == 'consumible'){
        this.csvProperty[line][row] = colorTrue;
        if (messageTrue){
          this.csvError[line][row]['messages'].push(messageTrue);
        }
      } else {
        this.csvProperty[line][row] = colorFalse;
        if (messageFalse){
          this.csvError[line][row]['messages'].push(messageFalse);
        }
      }
  }

  checkDecimal(keyword, line, row, messageTrue="", messageFalse="Formato no valido, utilize el formato '1234.00' o '1234'", colorTrue='green', colorFalse='red'){
      // numeral('1,000')
      // console.log("numeral", numeral('1.234,56')._value, parseFloat);
      if(!isNaN(keyword)){
        this.csvProperty[line][row] = colorTrue;
        if (messageTrue){
          this.csvError[line][row]['messages'].push(messageTrue);
        }
      } else {
        this.csvProperty[line][row] = colorFalse;
        if (messageFalse){
          this.csvError[line][row]['messages'].push(messageFalse);
        }
      }
  }

  checkExist(docType, keyword, field, line, row, messageTrue="", messageFalse="", colorTrue='red', colorFalse='green', create=false){
    if (keyword == ''){
      this.csvProperty[line][row] = colorFalse;
    } else {
      this.pouchdbService.searchDocField(docType, keyword, field).then((doca: any[])=>{
        if(doca.length!=0){
          this.csvProperty[line][row] = colorTrue;
          if (messageTrue){
            this.csvError[line][row]['messages'].push(messageTrue);
          }
        } else {
          this.csvProperty[line][row] = colorFalse;
          if (messageFalse){
            this.csvError[line][row]['messages'].push(messageFalse);
          }
          if (create){
            let data = {
                docType: docType,
                name: keyword,
            }
            // console.log("this.createList.indexOf(data)", this.createList.findIndex(i => i.name === keyword));
            // this.createList.findIndex(i => i.name === keyword);
            if (this.createList.findIndex(i => i.name === keyword)==-1){
              this.createList.push(data);
            }
          }
        }
      });
    }
  }

  import(){
    // this.csvData.forEach(doc=>{
    //   console.log("Doc", doc);
    // })f
    //this.loading.present();
    this.validate()
    // console.log("this.createList", this.createList);
    // var uniq = this.createList.reduce(function(a,b){
    //   if (a.indexOf(b) < 0 ) a.push(b);
    //   return a;
    // },[]);
    if (this.docType == 'product'){
      // //this.loading.present();
      let promise_ids = [];
      this.createList.forEach(data=>{
        if (data.docType == 'category'){
          promise_ids.push(this.categoryService.createCategory({
            "name": data.name,
          }))
        }
      })
      console.log("before promise");
      Promise.all(promise_ids).then(categories=>{
        console.log("created categs", categories);
        this.formatProducts(this.csvData).then((csv: any[])=>{
          let bigger_code:any = 0;
          let promise2_ids = [];
          let count = 1;
          csv.forEach(item => {
            count += 1;
            console.log("-- createProduct", item);
            if (parseInt(item.code)>bigger_code){
              bigger_code = item.code;
            }
            promise2_ids.push(this.productService.createProduct(item));
          })
          Promise.all(promise2_ids).then(async products=>{
            this.pouchdbService.getDoc('config.profile').then((config: any)=>{
              // console.log("config", bigger_code, config.product_sequence);
              if (parseInt(config.product_sequence) < (parseInt(bigger_code) + 1)){

                // let code = data[docType+'_sequence'].toString();
                //console.log("code", code);
                bigger_code = bigger_code.toString();
                let regex = /[0-9]+$/
                let string_end = bigger_code.match(regex).index;
                let number = bigger_code.match(regex)[0];
                let next_number = parseFloat(number)+1;
                let prefix = bigger_code.substr(0, string_end);
                let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
                let new_code = prefix+pad_number;
                config.product_sequence = new_code;
                // console.log("config2", new_code, config.product_sequence);
                this.pouchdbService.updateDoc(config);
              }
            })
            // bigger_code
            //this.loading.dismiss();
            this.navCtrl.navigateBack('/tabs/product-list');
            const alert = await this.alertCtrl.create({
              header: 'Importación Exitosa!',
              message: 'Tus Productos han sido importados con exito!',
              buttons: ['OK, Gracias']
            });
            alert.present();
          })
        })
      })
    } else if (this.docType == 'contact'){
      //this.loading.present();

      this.formatContacts(this.csvData).then((csv: any[])=>{
        let bigger_code:any = 0;
        let count = 1;
        let promise2_ids = [];
        csv.forEach(item => {
          count += 1;
          console.log("-- createContact", item);
          if (parseInt(item.code)>bigger_code){
            bigger_code = item.code;
          }
          promise2_ids.push(this.contactService.createContact(item));
        })
        Promise.all(promise2_ids).then(async contacts=>{
          this.pouchdbService.getDoc('config.profile').then((config: any)=>{
            // console.log("config", bigger_code, config.contact_sequence);
            if (parseInt(config.contact_sequence) < (parseInt(bigger_code) + 1)){

              // let code = data[docType+'_sequence'].toString();
              //console.log("code", code);
              bigger_code = bigger_code.toString();
              let regex = /[0-9]+$/
              let string_end = bigger_code.match(regex).index;
              let number = bigger_code.match(regex)[0];
              let next_number = parseFloat(number)+1;
              let prefix = bigger_code.substr(0, string_end);
              let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
              let new_code = prefix+pad_number;
              config.contact_sequence = new_code;
              // console.log("config2", new_code, config.contact_sequence);
              this.pouchdbService.updateDoc(config);
            }
          })

          //this.loading.dismiss();
          this.navCtrl.navigateBack('/contact-list');
          const alert = await this.alertCtrl.create({
            header: 'Importación Exitosa!',
            message: 'Tus Contatos han sido importados con exito!',
            buttons: ['OK, Gracias']
          });
          alert.present();
        })
      })
    } else if (this.docType == 'cash-move'){
      // //this.loading.present();
      this.formatCashMoves(this.csvData).then((csv: any[])=>{
        console.log("csv", csv);
        let bigger_code:any = 0;
        let count = 1;
        let promise2_ids = [];
        csv.forEach((item: any) => {
          console.log("createCashMove -", item);
          count += 1;
          if (parseInt(item.code)>bigger_code){
            bigger_code = item.code;
          }
          promise2_ids.push(this.cashMoveService.createCashMove(item));
        })
        Promise.all(promise2_ids).then(async contacts=>{
          this.pouchdbService.getDoc('config.profile').then((config: any)=>{
            // console.log("config", bigger_code, config.contact_sequence);
            if (parseInt(config.cash_move_sequence) < (parseInt(bigger_code) + 1)){

              // let code = data[docType+'_sequence'].toString();
              //console.log("code", code);
              bigger_code = bigger_code.toString();
              let regex = /[0-9]+$/
              let string_end = bigger_code.match(regex).index;
              let number = bigger_code.match(regex)[0];
              let next_number = parseFloat(number)+1;
              let prefix = bigger_code.substr(0, string_end);
              let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
              let new_code = prefix+pad_number;
              config.cash_move_sequence = new_code;
              // console.log("config2", new_code, config.contact_sequence);
              this.pouchdbService.updateDoc(config);
            }
          })
          //this.loading.dismiss();
          this.events.publish('import-cash-move');
          this.navCtrl.navigateBack('/tabs/cash-list');
          const alert = await this.alertCtrl.create({
            header: 'Importación Exitosa!',
            message: 'Tus Cuentas han sido importados con exito!',
            buttons: ['OK, Gracias']
          });
          alert.present();
        })
        // console.log("count", count);
      })
    } else if (this.docType == 'sale'){
      // //this.loading.present();
      // console.log("read file", csvData);
      // this.parseCSVFile(this.csvData).then((csv: any[])=>{
      this.formatSales(this.csvData).then((csv: any[])=>{
        let bigger_code:any = 0;
        let promise2_ids = [];
        console.log("csv", csv);
        let count = 1;
        csv.forEach((item: any) => {
          console.log("createSale -", JSON.stringify(item));
          count += 1;
          if (parseInt(item.code)>bigger_code){
            bigger_code = item.code;
          }
          promise2_ids.push(this.saleService.createSale(item));
        })
        Promise.all(promise2_ids).then(async sales=>{
          this.pouchdbService.getDoc('config.profile').then((config: any)=>{
            // console.log("config", bigger_code, config.product_sequence);
            if (parseInt(config.sale_sequence) < (parseInt(bigger_code) + 1)){

              // let code = data[docType+'_sequence'].toString();
              //console.log("code", code);
              bigger_code = bigger_code.toString();
              let regex = /[0-9]+$/
              let string_end = bigger_code.match(regex).index;
              let number = bigger_code.match(regex)[0];
              let next_number = parseFloat(number)+1;
              let prefix = bigger_code.substr(0, string_end);
              let pad_number = this.formatService.string_pad(number.length, next_number, "right", "0");
              let new_code = prefix+pad_number;
              config.sale_sequence = new_code;
              // console.log("config2", new_code, config.product_sequence);
              this.pouchdbService.updateDoc(config);
            }
          })
          // bigger_code
          //this.loading.dismiss();
          this.navCtrl.navigateBack('/tabs/sale-list');
          const alert = await this.alertCtrl.create({
            header: 'Importación Exitosa!',
            message: 'Tus Ventas han sido importadas con exito!',
            buttons: ['OK, Gracias']
          });
          alert.present();
          console.log("count", count);
          this.events.publish('import-sale');
        })
      })
    } else if (this.docType == 'sale-line'){
      // //this.loading.present();
      // console.log("read file", csvData);
      // this.parseCSVFile(this.csvData).then((csv: any[])=>{
      this.formatSaleLines(this.csvData).then((csv: any[])=>{
        let promise2_ids = [];
        Object.keys(csv).forEach(key => {
          promise2_ids.push(this.saleService.getSale('sale.'+key).then(doc=>{
            console.log("key", key, "doc", csv[key]['items']);
            // if (doc){
              doc.lines = csv[key]['items'];
              // doc.items = csv[key]['items'];
              // doc.teste = csv[key]['items'];
              doc.total = csv[key]['total'];
              this.saleService.updateSaleMigrated(doc);
            // }
          }))
        })
        Promise.all(promise2_ids).then(async data=>{
          console.log("FINISHED...");
          this.events.publish('import-sale');
          //this.loading.dismiss();
          this.navCtrl.navigateBack('/tabs/sale-list');
          const alert = await this.alertCtrl.create({
            header: 'Importación Exitosa!',
            message: 'Tus Lineas de Ventas han sido importadas con exito!',
            buttons: ['OK, Gracias']
          });
          alert.present();
          // console.log("count", count);
          // this.events.publish('import-sale');
        })
      })
    }
  }

  formatProducts(arr){
    return new Promise((resolve, reject)=>{
      let self = this;
      let code,
        name,
        price,
        cost,
        stock,
        tax,
        category_id,
        stock_min,
        type,
        note,
         obj = [];
     let promise_ids = [];
     let docs = [];

     for(var j = 0; j < arr.length; j++){
       var items = arr[j];
       docs.push(items);
       promise_ids.push(this.pouchdbService.searchDocField('category', items[6]));
     }
     console.log("Promisse_IDS BEFORE");
     Promise.all(promise_ids).then(categories=>{
       docs.forEach((doc, index)=>{
         let value = categories[index];
         obj.push({
            code: doc[0],
            name: doc[1],
            price: doc[2],
            cost: doc[3],
            stock: doc[4],
            tax: doc[5],
            category_id: categories[index][0]._id,
            stock_min: doc[7],
            type: doc[8],
            note: doc[9],
         });
       })
       console.log("obj", obj);
       resolve(obj);
     })
   });
  }

  formatContacts(arr){
    return new Promise((resolve, reject)=>{
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
     for(var j = 0; j < arr.length; j++) {
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
     resolve(obj);
   });
  }

  formatCashMoves(arr){
    return new Promise((resolve, reject)=>{
      let contact_id,
      amount,
      origin_id,
      date,
      date_due,
      note,
      accountFrom_id,
      accountTo_id,
      obj = [];
      // console.log("arr", arr);
      let promise_ids = [];
      let docs = [];
      for(var j = 0; j < arr.length; j++){
        var items         = arr[j];

          items[3] = new Date(items[3].split("/")[1]+"-"+items[3].split("/")[0]+"-"+items[3].split("/")[2]).toISOString();
          items[4] = new Date(items[4].split("/")[1]+"-"+items[4].split("/")[0]+"-"+items[4].split("/")[2]).toISOString();
          docs.push(items);
          console.log("items[7]", items[0]);
          promise_ids.push(this.pouchdbService.searchDocField('contact', items[0]));
          promise_ids.push(this.pouchdbService.searchDocField('account', items[5]));
          promise_ids.push(this.pouchdbService.searchDocField('account', items[6]));
      }
      console.log("Wait for promisses");
      Promise.all(promise_ids).then(contacts=>{
        // console.log("contactssss", JSON.stringify(contacts));
        let counter = 0;
        docs.forEach((doc, index)=>{
          console.log("DOCUMENT", doc[2]);
          // console.log("---contact", JSON.stringify(contacts[index][0]));
          // console.log("---accountFrom", JSON.stringify(contacts[counter+1][0]));
          // console.log("---accountTo", JSON.stringify(contacts[counter+2]));
          obj.push({
            contact_id: contacts[counter][0]._id,
            amount: parseFloat(doc[1].replace(".000", "000")),
            amount_unInvoiced: parseFloat(doc[1].replace(".000", "000")),
            origin_id: doc[2],
            date: doc[3],
            date_due: doc[4],
            name: doc[2],
            accountFrom_id: contacts[counter+1][0]._id,
            accountTo_id: contacts[counter+2][0]._id,
            note: doc[7],
          });
          counter += 3;
        })
        resolve(obj);
      })
    });
  }

  formatSales(arr){
    console.log("formatParsedObject");
    return new Promise((resolve, reject)=>{
      let contact_id,
      amount,
      origin_id,
      date,
      date_due,
      note,
      accountFrom_id,
      accountTo_id,
      obj = [];
      // console.log("arr", arr);
      let promise_ids = [];
      let docs = [];
      for(var j = 0; j < arr.length; j++){
        var items         = arr[j];

          // let date = items[3].split(' ')[0];
          // console.log("dat4e", JSON.stringify(items), JSON.stringify(date), date.split("/")[1]+"-"+date.split("/")[2]+"-"+date.split("/")[0]);
          // items[3] = new Date(date.split("/")[1]+"-"+date.split("/")[2]+"-"+date.split("/")[0]).toISOString();
          docs.push(items);
          // promise_ids.push(this.pouchdbService.findDocs({name: items[1]}, []));
          console.log("contact_name", items[1]);
          promise_ids.push(this.pouchdbService.searchDocField('contact', items[1]));
          promise_ids.push(this.pouchdbService.searchDocField('payment-condition', items[2]));
          // promise_ids.push(this.pouchdbService.findDocs({name: items[2]}, []));
      }
      console.log("Wait for promisses");
      Promise.all(promise_ids).then(contacts=>{
        // console.log("SALES CONTACTGS", JSON.stringify(contacts));
        let counter = 0;
        docs.forEach((doc, index)=>{
          // console.log("DOCUMENT", doc[2]);
          console.log("---contact", JSON.stringify(contacts[counter]), doc, "isso", counter);
          console.log("---payment", JSON.stringify(contacts[counter+1]), doc, "isso", counter);
          // console.log("---accountFrom", JSON.stringify(contacts[counter+1][0]));
          // console.log("---accountTo", JSON.stringify(contacts[counter+2]));
          obj.push({
            code: doc[0],
            contact_name: doc[1],
            contact_id: contacts[counter][0]._id,
            contact: contacts[counter][0],
            payment_name: doc[2],
            pay_cond_id: contacts[counter+1][0]._id,
            paymentCondition: contacts[counter+1][0],
            project: {},
            date: doc[3],
            name: "Venta Importada "+doc[0],
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

  formatSaleLines(arr){
    return new Promise((resolve, reject)=>{
      let contact_id,
      amount,
      origin_id,
      date,
      date_due,
      note,
      accountFrom_id,
      accountTo_id,
      obj = [];
      // console.log("arr", arr);
      let promise_ids = [];
      let docs = [];
      for(var j = 0; j < arr.length; j++){
        var items         = arr[j];

        // if(hasTitles === true && j === 0)
        // {
        //   // console.log("Title item", items);
        //   // sale_code = items[0];
        //   // product_name = items[1];
        //   // price = items[2];
        //   // quantity = items[3];
        // }
        // else {
          // let date = items[3].split(' ')[0];
          // items[3] = new Date(date.split("/")[1]+"-"+date.split("/")[2]+"-"+date.split("/")[0]).toISOString();
          docs.push(items);
          // promise_ids.push(this.pouchdbService.findDocs({name: items[1]}, []));
          console.log("items", items[1]);
          promise_ids.push(this.pouchdbService.searchDocField('product', items[1]));
          // promise_ids.push(this.pouchdbService.findDocs({name: items[2]}, []));
        // }
      }
      console.log("Wait for promisses");
      Promise.all(promise_ids).then(contacts=>{
        console.log("SALES CONTACTGS", JSON.stringify(contacts.slice(0, 5)));
        let sales = {};
        let counter = 0;
        docs.forEach((doc, index)=>{
          console.log("product", doc, "id", contacts[index]);
          if (sales.hasOwnProperty(doc[0])) {
            sales[doc[0]]['items'].push({
              'product_id': contacts[counter][0]._id,
              'quantity': parseFloat(doc[3]),
              'price': parseFloat(doc[2]),
              'cost': contacts[counter][0].cost,
            })
            sales[doc[0]]['total'] += parseFloat(doc[2])*parseFloat(doc[3]);
          } else {
            sales[doc[0]] = {
              'items': [{
                'product_id': contacts[counter][0]._id,
                'quantity': parseFloat(doc[3]),
                'price': parseFloat(doc[2]),
                'cost': contacts[counter][0].cost,
              }],
              'total': parseFloat(doc[2])*parseFloat(doc[3]),
            }
          }
          counter += 1;
        })
        resolve(sales);
      })
    });
  }

  resolveBoolean(value){
    if (1){
      return true;
    } else {
      return false;
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

  trackByFn(index: any, item: any) {
    return index;
  }

  ngOnInit() {
    console.log('ionViewDidLoad ImporterPage');
  }

  chooseFile() {
    console.log("choseFile");
    this.fileChooser.open()
      .then(uri => {
        this.filePath.resolveNativePath(uri)
          .then(filePath => {

            let tmppath = filePath.split("/");
            let file = filePath.split("/")[tmppath.length-1];
            let path = filePath.split(file)[0];
            console.log("file, path", path, file);
            // this.file.readAsText(path, file).then(data => {
            //   console.log("read file", data);
            //   data.slice(0,-1);
            //   console.log("read file2", data);
            //   this.extractData(data);
            // }).catch(err => {
            //   //console.log('Directory doesnt exist', JSON.stringify(err));
            // });
          })
          .catch(err => console.log(JSON.stringify(err)));

      })
      .catch(e => console.log(JSON.stringify(e)));
      // // this.viewCtrl.dismiss();
  }


  public changeListener(files: FileList){
    console.log(files);
    if(files && files.length > 0) {
       let file : File = files.item(0);
         console.log(file.name);
         console.log(file.size);
         console.log(file.type);
         let reader: FileReader = new FileReader();
         reader.readAsText(file);
         reader.onload = (e) => {
            let csv = reader.result;
            csv.slice(0,-1);
            this.extractData(csv);
            console.log(csv);
         }
      }
  }

}
