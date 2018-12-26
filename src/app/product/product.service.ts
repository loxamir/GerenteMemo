import { Injectable } from "@angular/core";
// import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    // public http: Http,
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}

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
        this.configService.getSequence('product').then((code) => {
          product['code'] = code;
          resolve(this.pouchdbService.createDoc(product));
        });
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
