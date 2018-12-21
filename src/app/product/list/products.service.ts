import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class ProductsService {

  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getProductsPage(keyword, page, type='all'){
    return new Promise((resolve, reject)=>{
      let promise_ids = [];
      if (type=='all') {
        promise_ids.push(this.pouchdbService.searchDocTypeData('product', keyword, page));
      } else {
        promise_ids.push(this.pouchdbService.searchDocTypeDataField('product', keyword, page, 'type', type));
      }
      promise_ids.push(this.pouchdbService.getView('stock/Depositos', 2));
      Promise.all(promise_ids).then((resList: any[]) => {
        let data: any[] = resList[0];
        let viewList: any[] = resList[1];
        data.forEach(product=>{
          //Get stock value from cash moves report
          let stock = 0;
          viewList.forEach(view=>{
            if (view.key[0].split(".")[1] == 'physical' && view.key[1] == product._id){
              stock += view.value;
            }
          })
          product.stock = stock;
        })
        resolve(data);
      })
    })
  }

  searchItems(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'product',
      keyword,
      page
    ).then((items) => {
        resolve(items);
      })
    })
  }

  deleteProduct(product) {
    return this.pouchdbService.deleteDoc(product);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Depositos', 2
    ).then((stocks: any[]) => {
      let data: any[] = list;
      let viewList: any[] = stocks;
      data.forEach(product=>{
        //Get stock value from cash moves report
        let stock = 0;
        viewList.forEach(view=>{
          if (view.key[0].split(".")[1] == 'physical' && view.key[1] == product._id){
            stock += view.value;
          }
        })
        product.stock = stock;
      })
    });
  }
}
