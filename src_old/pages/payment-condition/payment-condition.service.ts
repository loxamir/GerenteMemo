import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class PaymentConditionService {

  data: any;

  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
  ) {}

  getPaymentCondition(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then((paymentCondition: any)=>{
        this.pouchdbService.getList([
          paymentCondition.accountFrom_id,
          paymentCondition.accountTo_id,
        ]).then((accounts: any[])=>{
          paymentCondition.accountFrom = accounts[0].doc;
          paymentCondition.accountTo = accounts[1].doc;
          resolve(paymentCondition);
        })
      })
    })
  }

  createPaymentCondition(paymentCondition){
    paymentCondition.docType = 'payment-condition';
    return this.pouchdbService.createDoc(paymentCondition);
  }

  updatePaymentCondition(paymentCondition){
    paymentCondition.docType = 'payment-condition';
    return this.pouchdbService.updateDoc(paymentCondition);
  }

  getPaymentConditionList(keyword){
    return this.pouchdbService.searchDocTypeData('payment-condition');
  }

  deletePaymentCondition(paymentCondition) {
    return this.pouchdbService.deleteDoc(paymentCondition);
  }
}
