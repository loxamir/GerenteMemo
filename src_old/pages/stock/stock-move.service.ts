import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
import { ProductService } from '../product/product.service';
import { FormatService } from '../services/format.service';

@Injectable()
export class StockMoveService {

  constructor(
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
    public formatService: FormatService,
  ) {}

  getStockMove(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then((stock_move) => {
        this.pouchdbService.getDoc(stock_move['warehouseFrom_id']).then((warehouseFrom => {
          stock_move['warehouseFrom'] = warehouseFrom;
          this.pouchdbService.getDoc(stock_move['warehouseTo_id']).then((warehouseTo => {
            stock_move['warehouseTo'] = warehouseTo;
              this.pouchdbService.getDoc(stock_move['product_id']).then((product => {
                stock_move['product'] = product;
                this.pouchdbService.getDoc(stock_move['contact_id']).then(contact => {
                  stock_move['contact'] = contact || {};
                  console.log("stockMove", stock_move);
                  resolve(stock_move);
                });
              }));
            }));
        }));
      });
    });
  }

  createStockMove(viewData){
    return new Promise((resolve, reject)=>{
      let stock = Object.assign({}, viewData);
      this.productService.getProduct(stock.product_id).then(product=>{
        stock.product = product;
        stock.docType = 'stock-move';
        stock.quantity = parseFloat(stock.quantity);
        let product_cost = stock.cost/stock.quantity;
        if (stock.product && !stock.cost){
          product_cost = parseFloat(stock.product.cost);
        }
        let old_stock = parseFloat(stock.product.stock);
        let old_cost = parseFloat(stock.product.cost);
        if (stock.contact){
          stock.contact_name = stock.contact.name;
        }
        if (stock.warehouseFrom){
          stock.warehouseFrom_name = stock.warehouseFrom.name;
        }
        if (stock.warehouseTo){
          stock.warehouseTo_name = stock.warehouseTo.name;
        }
        if (stock.product){
          stock.product_name = stock.product.name;
        }
        this.configService.getSequence('stock_move').then((code) => {
          // stock['code'] = code;
          stock['code'] = this.formatService.string_pad(4, code, "right", "0");
          delete stock.stock;
          delete stock.product;
          delete stock.contact;
          delete stock.warehouseTo;
          delete stock.warehouseFrom;
          return this.pouchdbService.createDoc(stock).then(data => {
            if (stock.cost && stock.warehouseTo_id.split('.')[1] == 'physical'){
              this.productService.updateStockAndCost(
                stock.product_id,
                stock.quantity,
                product_cost,
                old_stock,
                old_cost);
            }
            resolve(data);
          })
        });
      });
    });
  }

  updateStockMove(viewData){
    let stock = Object.assign({}, viewData);
    stock.docType = 'stock-move';
    stock.quantity = parseFloat(stock.quantity);
    if (stock.contact){
      stock.contact_name = stock.contact.name;
    }
    delete stock.stock;
    delete stock.product;
    delete stock.contact;
    delete stock.warehouseTo;
    delete stock.warehouseFrom;
    return this.pouchdbService.updateDoc(stock);
  }

  deleteStockMove(stock){
    return this.pouchdbService.deleteDoc(stock);
  }

}
