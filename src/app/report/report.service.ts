import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '../config/config.service';
// import { SaleService } from '../sale/sale.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public configService: ConfigService,
    // public saleService: SaleService,
  ) {}

  getReport(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.unserializeReport(doc_id).then(viewData => {
        resolve(viewData);
      });
    });
  }
  getSaleReport(dateStart, dateEnd): Promise<any> {
    return new Promise((resolve, reject)=>{
      let result = {};
      let total = 0;
      let returns = 0;
      let cost = 0;
      this.pouchdbService.searchDocTypeData('sale', '', false).then((sales1: any[]) => {
        let sales = sales1
        .filter(word => word.date >= dateStart)
        .filter(word => word.date <= dateEnd);
        //console.log("sale", dateStart, dateEnd, sales1);
        sales.forEach(sale => {
          total += parseFloat(sale.total);
          sale['lines'].forEach(line => {
            if (line.quantity < 0){
              returns += parseFloat(line.quantity)*parseFloat(line.price);
            }
            cost += parseFloat(line.cost||0)*parseFloat(line.quantity);
            // if (products.hasOwnProperty(line.product_id)) {
            //   products[line.product_id]['total'] += line.price * line.quantity;
            // } else {
            //   products[line.product_id] = {
            //     'product_id': line.product_id,
            //     'total': line.price * line.quantity,
            //   }
            // }
          })
        });
        result = {
          'total': total,
          'returns': returns,
          'cost': cost,
        }
        resolve(result);
      });
    });
  }

  getCashMoveReport(dateStart, dateEnd): Promise<any> {
    return new Promise((resolve, reject)=>{
      let result = {};
      let admin = 0;
      let incomeFinance = 0;
      let expenseFinance = 0;
      let depre = 0;
      let other = 0;
      this.pouchdbService.searchDocTypeData('cash-move', '', false).then((sales1: any[]) => {
        let sales = sales1
        .filter(word => word.date >= dateStart)
        .filter(word => word.date <= dateEnd);
        //console.log("sale", dateStart, dateEnd, sales1);
        sales.forEach(sale => {
          if (sale.account_id == 'account.other.salary'){
            admin -= parseFloat(sale.amount);
          } else if (sale.account_id == 'account.income.sale' || sale.account_id == 'account.other.transitStock'){

          } else {
            other-= parseFloat(sale.amount);
          }
          // total += parseFloat(sale.total);
          // sale['lines'].forEach(line => {
          //   if (line.quantity < 0){
          //     returns += parseFloat(line.quantity*line.price);
          //   }
          //   cost += parseFloat((line.cost||0)*line.quantity);
          //   // if (products.hasOwnProperty(line.product_id)) {
          //   //   products[line.product_id]['total'] += line.price * line.quantity;
          //   // } else {
          //   //   products[line.product_id] = {
          //   //     'product_id': line.product_id,
          //   //     'total': line.price * line.quantity,
          //   //   }
          //   // }
          // })
        });
        result = {
          'admin': admin,
          'incomeFinance': incomeFinance,
          'expenseFinance': expenseFinance,
          'depre': depre,
          'other': other,
        }
        resolve(result);
      });
    });
  }

  getServiceReport(dateStart, dateEnd): Promise<any> {
    return new Promise((resolve, reject)=>{
      let total = 0;
      this.pouchdbService.searchDocTypeData('service', '', false).then((sales1: any[]) => {
        let sales = sales1
        .filter(word => word.date >= dateStart)
        .filter(word => word.date <= dateEnd);
        sales.forEach(sale => {
          total += parseFloat(sale.total);
        });
        resolve(total);
      });
    });
  }

  getCashReport(): Promise<any> {
    return new Promise((resolve, reject)=>{
      let result = {
        'cash': 0,
        'bank': 0,
        'check': 0,
      };
      this.pouchdbService.searchDocTypeData('cash', '', false).then((sales1: any[]) => {
        let sales = sales1;
        sales.forEach(cash => {
          if (cash.type == 'cash'){
            result['cash'] += parseFloat(cash.balance);
          }
          else if (cash.type == 'bank'){
            result['bank'] += parseFloat(cash.balance);
          }
          else if (cash.type == 'check'){
            result['check'] += parseFloat(cash.balance);
          }
        });
        resolve(result);
      });
    });
  }

  getPlannedReport(): Promise<any> {
    return new Promise((resolve, reject)=>{
      let result = {
        'income': 0,
        'expense': 0,
      };
      this.pouchdbService.searchDocTypeData('planned', '', false).then((sales1: any[]) => {
        let sales = sales1.filter(word => word.state != 'PAID');
        sales.forEach(cash => {
          if (cash.signal == '+'){
            result['income'] += parseFloat(cash.amount);
          }
          else if (cash.signal == '-'){
            result['expense'] += parseFloat(cash.amount);
          }
        });
        resolve(result);
      });
    });
  }

  getAssetReport(): Promise<any> {
    return new Promise((resolve, reject)=>{
      let result = {
        'vehicle': 0,
        'furniture': 0,
      };
      this.pouchdbService.searchDocTypeData('asset', '', false).then((sales1: any[]) => {
        let sales = sales1;
        //console.log("asset", sales);
        sales.forEach(cash => {
          if (cash.type == 'vehicle'){
            result['vehicle'] += parseFloat(cash.value);
          }
          else if (cash.type != 'vehicle'){
            result['furniture'] += parseFloat(cash.value);
          }
        });
        resolve(result);
      });
    });
  }


  getStockReport(): Promise<any> {
    return new Promise((resolve, reject)=>{
      let result = {
        'inventory': 0,
      };
      this.pouchdbService.searchDocTypeData('product', '', false).then((sales1: any[]) => {
        let sales = sales1;
        sales.forEach(product => {
          if (product.type != 'service'){
            //console.log("product", product, result);
            result['inventory'] += parseFloat(product.stock||0)*parseFloat(product.cost||0);
          }
        });
        resolve(result);
      });
    });
  }


  getInvoiceReport(dateStart, dateEnd, type): Promise<any> {
    return new Promise((resolve, reject)=>{
      let tax = 0;
      this.pouchdbService.searchDocTypeData('invoice', '', false).then((data1: any[]) => {
        //console.log("Invoice", dateStart, dateEnd, data1);
        let data = data1
        .filter(word => word.type == type)
        .filter(word => word.date >= dateStart)
        .filter(word => word.date <= dateEnd);
        data.forEach(invoice => {
          tax += parseFloat(invoice.tax);
        });
        resolve(tax);
      });
    });
  }

  createReport(viewData){
    return new Promise((resolve, reject)=>{
      let report = this.serializeReport(viewData)
      this.configService.getSequence('report').then((code) => {
        report['code'] = code;
        this.pouchdbService.createDoc(report).then(doc => {
          resolve({doc: doc, report: report});
        });
      });
    });
  }

  serializeReport(viewData){
    let report = Object.assign({}, viewData);
    report.lines = [];
    report.docType = 'report';
    delete report.payments;
    delete report.planned;
    report.contact_id = report.contact._id;
    delete report.contact;
    report.pay_cond_id = report.paymentCondition._id;
    delete report.paymentCondition;
    report.items.forEach(item => {
      report.lines.push({
        product_id: item.product_id || item.product._id,
        quantity: item.quantity,
        price: item.price,
      })
      //item['product_id'] = item.product_id || item.product._id;
    });
    delete report.items;
    return report;
  }

  unserializeReport(doc_id){
    return new Promise((resolve, reject)=>{
      return this.pouchdbService.getDoc(doc_id).then((pouchData => {
        let promise_ids = []
        let index = 0;
        let get_contact = false;
        let pay_cond_id = false;
        ////console.log("pouchData",pouchData);
        if (pouchData['contact_id']){

          promise_ids.push(this.pouchdbService.getDoc(pouchData['contact_id']));
          get_contact = true;
          index += 1;
        }
        if (pouchData['pay_cond_id']){
          pay_cond_id = true;
          promise_ids.push(this.pouchdbService.getDoc(pouchData['pay_cond_id']));
          index += 1;
        }
        pouchData['lines'].forEach((item) => {
          promise_ids.push(this.productService.getProduct(item['product_id']));
        });
        pouchData['items'] = [];
        Promise.all(promise_ids).then((promise_data) => {
          if (get_contact){
            pouchData['contact'] = promise_data[0];
          }
          if (pay_cond_id){
            pouchData['paymentCondition'] = promise_data[1];
          }
          for(let i=index;i<pouchData['lines'].length+index;i++){
            pouchData['items'].push({
              'product': promise_data[i],
              'description': promise_data[i].name,
              'quantity': pouchData['lines'][i-index]['quantity'],
              'price': pouchData['lines'][i-index]['price'],
            })
          }
          this.pouchdbService.getRelated(
          "receipt", "origin_ids", doc_id).then((receipts) => {
            // //console.log("receipts", receipts, doc_id);
            pouchData['payments'] = receipts;
            this.pouchdbService.getRelated(
            "planned", "origin_id", doc_id).then((planned) => {
              // //console.log("plannned", planned);
              pouchData['planned'] = planned;
              resolve(pouchData);
            });
          });
        });
      }));
    });
  }

  updateReport(viewData){
    let report = this.serializeReport(viewData)
    return this.pouchdbService.updateDoc(report);
  }

  deleteReport(report){
  //  if (report.state == 'QUOTATION'){
      return this.pouchdbService.deleteDoc(report);
  //  }
  }
}
