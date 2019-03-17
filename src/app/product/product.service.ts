import { Injectable } from "@angular/core";
// import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
// import { StockMoveService } from '../stock-move/stock-move.service';
// import { CashMoveService } from '../cash-move/cash-move.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    // public http: Http,
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    // public cashMoveService: CashMoveService,
    // public stockMoveService: StockMoveService,
  ) {}

  getProduct(doc_id): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let product:any = await this.pouchdbService.getDoc(doc_id);
      product.category = (await  this.pouchdbService.getDoc(product['category_id'])||{});
      product.brand = (await  this.pouchdbService.getDoc(product['brand_id'])||{});
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
      if (product.code != ''){
        resolve(this.pouchdbService.createDoc(product));
      } else {
        this.configService.getSequence('product').then((code) => {
          product['code'] = code;
          resolve(this.pouchdbService.createDoc(product));
        });
      }
      // if (product.stock > 0){
      //   this.createInventoryAdjustment(product, product.stock);
      // }
    });
  }

  updateProduct(viewData){
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
