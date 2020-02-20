import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    public pouchdbService: PouchdbService,
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
}
