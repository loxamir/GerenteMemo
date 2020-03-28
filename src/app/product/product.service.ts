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

  createProduct(viewData, changed_images = []){
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
                }
              })
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
          delete product._attachments[image.name];
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
}
