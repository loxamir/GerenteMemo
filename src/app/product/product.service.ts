import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
import { FormatService } from '../services/format.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    public formatService: FormatService,
  ) {}

  getProduct(doc_id): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let product:any = await this.pouchdbService.getDoc(doc_id, true);
      let getList = [
        product['category_id'],
        product['brand_id'],
      ];
      product['related_products'] = product['related_products'] || [];
      product['related_products'].forEach((item) => {
        if (getList.indexOf(item['product_id'])==-1){
          getList.push(item['product_id']);
        }
      });

      this.pouchdbService.getList(getList, true).then((docs: any[])=>{
        var doc_dict = {};
        docs.forEach(row=>{
          doc_dict[row.id] = row.doc;
        })
        product.category = doc_dict[product.category_id] || {};
        product.brand = doc_dict[product.brand_id] || {};
        product['products'] = [];
        product.related_products.forEach((line: any)=>{
          product['products'].push(doc_dict[line.product_id]);
        })
        console.log("products", product['products']);
        product.stock = 0;
        if (product._attachments && product._attachments['avatar.png']) {
          let avatar = product._attachments['avatar.png'].data;
          product.image = "data:image/png;base64," + avatar;
        } else {
          product.image = "./assets/images/sem_foto.jpg";
        }
        resolve(product);
      });
    });
  }
  getProductByCode(code): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let product:any = await this.pouchdbService.getView('stock/barcode', undefined,
      [code.toString()],
      [code.toString()+"z"],
      true,
      true,
      undefined,
      undefined,
      true,
      )
      if (product[0]){
        resolve(product[0].doc);
      } else {
        resolve(false)
      }
    });
  }

  createProduct(viewData, blob = undefined){
    return new Promise((resolve, reject)=>{
      let product = Object.assign({}, viewData);
      product.docType = 'product';
      product.price = product.price && parseFloat(product.price) || 0;
      product.cost = product.cost && parseFloat(product.cost) || 0;
      product.stock = product.stock && parseFloat(product.stock) || 0;
      product.stock_min = product.stock_min && parseFloat(product.stock_min) || 0;
      product.category_id = product.category && product.category._id || product.category_id;
      product.category_name = product.category && product.category.name || product.category_name;
      delete product.category;
      product.brand_id = product.brand && product.brand._id || product.brand_id;
      product.brand_name = product.brand && product.brand.name || product.brand_name;
      delete product.brand;
      delete product.image;
      product.related_products = [];
      product.products.forEach(item => {
        product.related_products.push({
          product_id: item.product_id || item.product._id,
          product_name: item.product.name || item.product_name,
        })
      });
      delete product.products;
      if (product.code != ''){
        resolve(this.pouchdbService.createDoc(product));
      } else {
        this.configService.getSequence('product').then((code) => {

          product['code'] = code;
          this.pouchdbService.createDoc(product).then(async doc => {
            if (blob) {
              let avai = await this.pouchdbService.attachFile(doc['id'], 'avatar.png', blob);
            }
            resolve({ doc: doc, product: product });
            // resolve(this.pouchdbService.createDoc(product));
          });


        });
      }
      // if (product.stock > 0){
      //   this.createInventoryAdjustment(product, product.stock);
      // }
    });
  }

  async updateProduct(viewData, changed_images = []){
    let product = Object.assign({}, viewData);
    product.docType = 'product';
    product.price = product.price && parseFloat(product.price) || 0;
    product.cost = product.cost && parseFloat(product.cost) || 0;
    product.stock = product.stock && parseFloat(product.stock) || 0;
    product.stock_min = product.stock_min && parseFloat(product.stock_min) || 0;
    if (product.category){
      product.category_id = product.category._id;
    }
    product.category_name = product.category && product.category.name || product.category_name;
    delete product.category;
    if (product.brand){
      product.brand_id = product.brand._id;
    }
    product.brand_name = product.brand && product.brand.name || product.brand_name;
    delete product.brand;
    delete product.image;
    console.log("changed_images", changed_images);
    if (changed_images.length) {
      await this.formatService.asyncForEach(changed_images, async (image: any) => {
        if (image.action == 'ADD'){
          //Add image
          let dda = image.image.split('base64,')[1];
          await this.pouchdbService.attachFile(product._id, image.name, dda);
          let data: any = await this.pouchdbService.getDoc(product._id);
          let attachments = data._attachments;
          product._rev = data._rev;
          product._attachments = attachments;
        } else if (image.action == 'DEL'){
          //Remove image
        }
      })
    }
    product.related_products = [];
    product.products.forEach(item => {
      product.related_products.push({
        product_id: item._id || item.product_id,
        product_name: item.name || item.product_name,
      })
    });
    delete product.products;
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

  // createInventoryAdjustment(product_data, difference){
  //   // if(product_data.stock != this.theoreticalStock){
  //     this.configService.getConfigDoc().then((config: any)=>{
  //       // let difference = (product_data.stock - theoreticalStock);
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
  //         'name': "Ajuste "+product_data.code,
  //         'quantity': Math.abs(difference),
  //         'origin_id': product_data._id,
  //         'contact_id': "contact.myCompany",
  //         'product_id': product_data._id,
  //         'date': new Date(),
  //         'cost': product_data.cost*Math.abs(difference),
  //         'warehouseFrom_id': warehouseFrom_id,
  //         'warehouseTo_id': warehouseTo_id,
  //       }).then(res => {
  //         console.log("res", res);
  //       });
  //
  //       this.cashMoveService.createCashMove({
  //         'name': "Ajuste "+product_data.code,
  //         'contact_id': "contact.myCompany",
  //         'amount': product_data.cost*Math.abs(difference),
  //         'origin_id': product_data._id,
  //         // "project_id": product_data.project_id,
  //         'date': new Date(),
  //         'accountFrom_id': accountFrom_id,
  //         'accountTo_id': accountTo_id,
  //       }).then((plan: any) => {
  //         //console.log("Plan", plan);
  //         // data['_id'] = plan.id;
  //         // this.saleForm.value.planned.push(data);
  //       })
  //     });
  //   // }
  // }
}
