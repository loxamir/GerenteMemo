import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class InvoiceService {

  constructor(
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
  ) {}

  getInvoice(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializeInvoice(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }

  createInvoice(viewData){
    return new Promise((resolve, reject)=>{
      let invoice = this.serializeInvoice(viewData)
      this.pouchdbService.createDoc(invoice).then(doc => {
        resolve({doc: doc, invoice: invoice});
      });
    });
  }

  serializeInvoice(viewData){
    let invoice = Object.assign({}, viewData);
    invoice.lines = [];
    invoice.docType = 'invoice';
    delete invoice.payments;
    delete invoice.planned;
    invoice.contact_id = invoice.contact._id;
    delete invoice.contact;
    invoice.items.forEach(item => {
      invoice.lines.push({
        product_id: item.product_id || item.product._id,
        quantity: item.quantity,
        price: item.price,
        description: item.description,
      })
    });
    delete invoice.items;
    return invoice;
  }

  unserializeInvoice(doc_id){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
        let getList = [
          pouchData['contact_id'],
        ];
        pouchData['lines'].forEach((item) => {
          if (getList.indexOf(item['product_id'])==-1){
            getList.push(item['product_id']);
          }
        });
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.contact = doc_dict[pouchData.contact_id] || {};
          pouchData['items'] = [];
          pouchData.lines.forEach((line: any)=>{
            pouchData['items'].push({
              'product': doc_dict[line.product_id],
              'description': doc_dict[line.product_id].name,
              'quantity': line.quantity,
              'price': line.price,
            })
          })
          resolve(pouchData);
        })
      }));
    });
  }

  updateInvoice(viewData){
    let invoice = this.serializeInvoice(viewData)
    return this.pouchdbService.updateDoc(invoice);
  }

  deleteInvoice(invoice){
    return this.pouchdbService.deleteDoc(invoice);
  }
}
